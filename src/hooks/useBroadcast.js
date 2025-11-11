import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import api from '../api/api';

// Hook to manage teams/groups
export const useTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups');
      const teamsData = await Promise.all(
        response.data.groups.map(async (group) => {
          // Fetch latest message for each group
          let lastMessage = 'No messages yet';
          let lastMessageTime = group.updatedAt;
          
          try {
            const messagesResponse = await api.get(`/broadcasts/${group._id}`);
            const broadcasts = messagesResponse.data.broadcasts;
            if (broadcasts && broadcasts.length > 0) {
              const latestBroadcast = broadcasts[broadcasts.length - 1];
              lastMessage = latestBroadcast.message.length > 50 
                ? `${latestBroadcast.message.substring(0, 50)}...` 
                : latestBroadcast.message;
              lastMessageTime = latestBroadcast.createdAt;
            }
          } catch {
            console.log(`No messages found for group ${group._id}`);
          }
          
          return {
            id: group._id,
            name: group.name,
            lastMessage,
            time: new Date(lastMessageTime).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            }),
            members: group.members,
            createdBy: group.createdBy
          };
        })
      );
      
      // Add "All" team at the beginning
      const allTeam = {
        id: 'all',
        name: 'All',
        lastMessage: 'All team communications',
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        members: [],
        createdBy: null
      };
      
      setTeams([allTeam, ...teamsData]);
      setError(null);
    } catch (err) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData) => {
    try {
      const response = await api.post('/groups', teamData);
      await fetchTeams(); // Refresh teams list
      return response.data;
    } catch (err) {
      setError('Failed to create team');
      throw err;
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam
  };
};

// Hook to manage users for team creation
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/teams');
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers
  };
};

// Hook to manage broadcasts/messages per group
let broadcastSocket = null;

const resolveWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const apiBase = api?.defaults?.baseURL;
  if (apiBase) {
    try {
      return new URL(apiBase).origin;
    } catch {
      return apiBase;
    }
  }
  if (typeof window !== 'undefined') {
    // Fallback to current origin; useful when backend is served from same host
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

const ensureBroadcastSocket = () => {
  if (broadcastSocket) return broadcastSocket;
  const wsUrl = resolveWsUrl();
  broadcastSocket = io(wsUrl, {
    auth: { token: localStorage.getItem('token') || undefined },
    transports: ['websocket', 'polling'],
    withCredentials: true
  });
  return broadcastSocket;
};

export const useBroadcasts = (groupId) => {
  const [messagesPerGroup, setMessagesPerGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const previousGroupRef = useRef(null);
  const currentUserIdRef = useRef(null);

  // Get messages for current group
  const messages = messagesPerGroup[groupId] || [];

  const ensureCurrentUserId = () => {
    if (currentUserIdRef.current) return currentUserIdRef.current;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        currentUserIdRef.current = payload?.userId || payload?._id || payload?.id || null;
        return currentUserIdRef.current;
      }
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      currentUserIdRef.current = user?._id || user?.userId || user?.id || null;
      return currentUserIdRef.current;
    } catch (err) {
      console.error('Failed to determine current user id', err);
      currentUserIdRef.current = null;
      return null;
    }
  };

  const formatMessage = (broadcast) => {
    if (!broadcast) return null;
    const createdAt = broadcast.createdAt || broadcast.timestamp || new Date().toISOString();
    const createdBy = broadcast.createdBy || {};
    const createdById = typeof createdBy === 'object' ? (createdBy._id || createdBy.id) : createdBy;
    const currentUserId = ensureCurrentUserId();
    const id = broadcast._id || broadcast.id || broadcast.broadcastId;
    return {
      id,
      _id: id,
      text: broadcast.message || broadcast.text || '',
      time: new Date(createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      isOwn: Boolean(currentUserId && createdById && String(createdById) === String(currentUserId)),
      seen: broadcast.seen || false,
      seenCount: broadcast.seenCount || broadcast.seenUsers?.length || 0,
      attachmentUrl: broadcast.attachmentUrl || broadcast.fileUrl || null,
      attachmentType: broadcast.attachmentType || broadcast.fileType || null,
      createdAt,
      createdBy
    };
  };

  // Fetch messages for a specific group
  const fetchMessages = async (targetGroupId) => {
    if (!targetGroupId || targetGroupId === 'all') return;
    
    try {
      setLoading(true);
      // Fetch messages for specific group using the API endpoint
      const response = await api.get(`/broadcasts/${targetGroupId}`);
      
      const formattedMessages = response.data.broadcasts
        ?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        ?.map(formatMessage)
        ?.filter(Boolean) || [];

      setMessagesPerGroup(prev => ({
        ...prev,
        [targetGroupId]: formattedMessages
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching messages for group:', targetGroupId, err);
      // If fetch fails, initialize empty array for this group
      setMessagesPerGroup(prev => ({
        ...prev,
        [targetGroupId]: []
      }));
    } finally {
      setLoading(false);
    }
  };

  const sendBroadcast = async (messageData, attachment = null) => {
    if (!groupId || groupId === 'all') {
      setError('Cannot send messages to "All" team');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('groupId', groupId);
      formData.append('message', messageData.text);
      
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const response = await api.post('/broadcasts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newMessage = formatMessage({
        ...response.data.broadcast,
        createdBy: response.data.broadcast.createdBy || { _id: ensureCurrentUserId() },
        message: response.data.broadcast.message
      });

      // Add message only to the current group
      setMessagesPerGroup(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), newMessage].filter(Boolean)
      }));
      
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to send broadcast');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear messages when switching groups
  const clearMessages = () => {
    // Remove messages for the current groupId so UI doesn't show stale data
    if (groupId && groupId !== 'all') {
      setMessagesPerGroup(prev => ({
        ...prev,
        [groupId]: []
      }));
    }
    setError(null);
  };

  useEffect(() => {
    const socket = ensureBroadcastSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      const userId = ensureCurrentUserId();
      if (userId) {
        socket.emit('register_user', userId);
      }
      const activeGroup = previousGroupRef.current || (groupId && groupId !== 'all' ? groupId : null);
      if (activeGroup) {
        const payload = { groupId: activeGroup };
        socket.emit('join_group', payload);
        socket.emit('broadcast:join', payload);
      }
    };

    const handleIncoming = (payload) => {
      const targetGroup = payload?.groupId || (typeof payload?.group === 'string' ? payload.group : payload?.group?._id);
      if (!targetGroup) return;
      const formatted = formatMessage(payload);
      if (!formatted) return;
      setMessagesPerGroup(prev => {
        const existing = prev[targetGroup] || [];
        const already = formatted._id && existing.some(msg => (msg._id || msg.id) === formatted._id);
        if (already) return prev;
        return {
          ...prev,
          [targetGroup]: [...existing, formatted]
        };
      });
    };

    socket.on('connect', handleConnect);
    socket.on('broadcast_message', handleIncoming);
    socket.on('broadcast:new', handleIncoming);
    socket.on('broadcast_received', handleIncoming);
    socket.on('broadcast:message', handleIncoming);
    socket.on('broadcast-message', handleIncoming);
    socket.on('broadcast_new', handleIncoming);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('broadcast_message', handleIncoming);
      socket.off('broadcast:new', handleIncoming);
      socket.off('broadcast_received', handleIncoming);
      socket.off('broadcast:message', handleIncoming);
      socket.off('broadcast-message', handleIncoming);
      socket.off('broadcast_new', handleIncoming);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const socket = socketRef.current || ensureBroadcastSocket();
    socketRef.current = socket;
    const prevGroup = previousGroupRef.current;
    if (prevGroup && prevGroup !== 'all' && prevGroup !== groupId) {
      const payload = { groupId: prevGroup };
      socket.emit('leave_group', payload);
      socket.emit('broadcast:leave', payload);
    }
    if (groupId && groupId !== 'all') {
      const payload = { groupId };
      socket.emit('join_group', payload);
      socket.emit('broadcast:join', payload);
    }
    previousGroupRef.current = groupId || null;
  }, [groupId]);

  // Fetch messages when groupId changes
  useEffect(() => {
    if (groupId && groupId !== 'all') {
      fetchMessages(groupId);
    }
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    messages,
    loading,
    error,
    sendBroadcast,
    fetchMessages,
    clearMessages
  };
};
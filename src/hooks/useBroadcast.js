import { useState, useEffect } from 'react';
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
export const useBroadcasts = (groupId) => {
  const [messagesPerGroup, setMessagesPerGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get messages for current group
  const messages = messagesPerGroup[groupId] || [];

  // Fetch messages for a specific group
  const fetchMessages = async (targetGroupId) => {
    if (!targetGroupId || targetGroupId === 'all') return;
    
    try {
      setLoading(true);
      // Fetch messages for specific group using the API endpoint
      const response = await api.get(`/broadcasts/${targetGroupId}`);
      
      const formattedMessages = response.data.broadcasts
        ?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Sort by creation date ascending
        ?.map(broadcast => ({
          id: broadcast._id,
          text: broadcast.message,
          time: new Date(broadcast.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          }),
          isOwn: broadcast.createdBy._id === getCurrentUserId(),
          seen: broadcast.seen || false,
          seenCount: broadcast.seenCount || 0,
          attachmentUrl: broadcast.attachmentUrl,
          attachmentType: broadcast.attachmentType,
          createdBy: broadcast.createdBy,
          createdAt: broadcast.createdAt
        })) || [];

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

  // Helper function to get current user ID
  const getCurrentUserId = () => {
    try {
      // Try to get from localStorage first
      const token = localStorage.getItem('token');
      if (token) {
        // Decode JWT token to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
      
      // Fallback: try to get from user object in localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user._id || user.userId || null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
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

      const newMessage = {
        id: response.data.broadcast._id,
        text: response.data.broadcast.message,
        time: new Date(response.data.broadcast.createdAt).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        }),
        isOwn: true,
        seen: false,
        seenCount: 0,
        attachmentUrl: response.data.broadcast.attachmentUrl,
        attachmentType: response.data.broadcast.attachmentType
        ,
        // Ensure createdAt is present so MessageList grouping can include this message immediately
        createdAt: response.data.broadcast.createdAt,
        createdBy: response.data.broadcast.createdBy
      };

      // Add message only to the current group
      setMessagesPerGroup(prev => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), newMessage]
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
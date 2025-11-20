import React, { useState } from 'react';
import ChatList from './shared/ChatListNew';
import ChatHeader from './shared/ChatHeader';
import MessageList from './shared/MessageList';
import MessageComposer from './shared/MessageComposer';
import CreateTeamModal from './shared/CreateTeamModal';
import { useTeams, useBroadcasts } from '../../hooks/useBroadcast';

const AdminBroadCast = () => {
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { teams, loading: teamsLoading, createTeam } = useTeams();
  const selectedTeamData = teams.find(team => team.id === selectedTeamId);
  const { messages, sendBroadcast, clearMessages } = useBroadcasts(selectedTeamId);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle team selection and clear messages
  const handleTeamSelect = (teamId) => {
    clearMessages();
    setSelectedTeamId(teamId);
  };

  const handleSendMessage = async (messageData, attachment = null) => {
    if (selectedTeamId) {
      try {
        await sendBroadcast(messageData, attachment);
      } catch (error) {
        console.error('Error sending broadcast:', error);
      }
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      await createTeam(teamData);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center h-[85vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between gap-4  h-[85vh] overflow-hidden">
      <ChatList 
        teams={filteredTeams}
        selectedTeam={selectedTeamId}
        onTeamSelect={handleTeamSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showAddButton={true}
        onAddTeam={() => setIsCreateModalOpen(true)}
      />
      
      <div className="flex-1 min-w-0 bg-white rounded-lg flex flex-col h-[80vh] overflow-hidden">
        <ChatHeader 
          teamName={selectedTeamData?.name || 'All'}
          showActiveCount={Boolean(selectedTeamId)}
          activeCount={selectedTeamData?.members?.length || 0}
        />
        
        <MessageList 
          messages={messages}
          showSeenIndicators={true}
        />
        
        <MessageComposer
          onSendMessage={handleSendMessage}
          disabled={!selectedTeamId}
        />
      </div>
      
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  );
};

export default AdminBroadCast;

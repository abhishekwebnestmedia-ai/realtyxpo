import React, { useState } from 'react';
import ChatList from './shared/ChatListNew';
import ChatHeader from './shared/ChatHeader';
import MessageList from './shared/MessageList';
import { useTeams, useBroadcasts } from '../../hooks/useBroadcast';

const UserBroadCast = () => {
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { teams, loading: teamsLoading } = useTeams();
  const selectedTeamData = teams.find(team => team.name === selectedTeam);
  const { messages, clearMessages } = useBroadcasts(selectedTeamData?.id);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle team selection and clear messages
  const handleTeamSelect = (teamName) => {
    clearMessages();
    setSelectedTeam(teamName);
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
    <div className="flex gap-4  h-[85vh] overflow-hidden">
      <ChatList
        teams={filteredTeams}
        onTeamSelect={handleTeamSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 min-w-0 bg-white rounded-lg flex flex-col h-[80vh] overflow-hidden">
        <ChatHeader
          teamName={selectedTeam}
          showActiveCount={selectedTeam !== 'All'}
          activeCount={selectedTeamData?.members?.length || 0}
        />

        <MessageList messages={messages} />
      </div>
    </div>
  );
};

export default UserBroadCast;

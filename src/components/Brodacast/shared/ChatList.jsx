import React from 'react';
import { Search, Plus } from 'lucide-react';

const ChatList = ({ 
  teams, 
  selectedTeam, 
  onTeamSelect, 
  searchQuery, 
  onSearchChange,
  showAddButton = false,
  selectedStyle = 'bg-blue-50',
  onAddTeam
}) => {
  return (
    <div className="w-96 bg-white rounded-lg flex flex-col h-[80vh] overflow-hidden">
      {/* Search Section with optional Plus Button */}
      <div className="p-4 flex-shrink-0">
        <div className={showAddButton ? "flex gap-2" : "relative"}>
          {showAddButton ? (
            <>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <button 
                className="p-3 bg-[var(--blue700)] text-white rounded-lg hover:bg-blue-800 transition-colors"
                onClick={onAddTeam}
              >
                <Plus size={16} />
              </button>
            </>
          ) : (
            <>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </>
          )}
        </div>
      </div>

      {/* Teams List */}
      <div className="flex-1 overflow-y-auto scrollbar-hidden m-1">
        {teams.map((team) => (
          <div
            key={team.id}
            onClick={() => onTeamSelect(team.name)}
            className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
              selectedTeam === team.name ? selectedStyle : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{team.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{team.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">{team.lastMessage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;

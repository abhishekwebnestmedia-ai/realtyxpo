import React from 'react';
import { X, User } from 'lucide-react';

const TeamMembersModal = ({ isOpen, onClose, teamName, members = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Group: <span className="font-medium text-gray-900">{teamName}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Total Members: <span className="font-medium text-gray-900">{members.length}</span>
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No members in this group</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div 
                  key={member._id || member.id || index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">
                      {(member.name || member.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {member.name || 'Unknown User'}
                    </p>
                    {member.email && (
                      <p className="text-sm text-gray-500 truncate">
                        {member.email}
                      </p>
                    )}
                    {member.role && (
                      <p className="text-xs text-gray-400 capitalize">
                        {member.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersModal;

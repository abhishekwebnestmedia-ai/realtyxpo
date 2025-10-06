import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const MyTeam = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching team members from: /auth/teams');
      const response = await api.get('/auth/teams');
      console.log('Teams API response:', response.data);
      
      let usersData = [];
      if (response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
        console.log('Found users in response.data.users:', usersData.length);
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
        console.log('Found users in direct array:', usersData.length);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
        console.log('Found users in response.data.data:', usersData.length);
      } else {
        console.log('No recognizable user data structure found:', response.data);
      }
      
      console.log('Processed users:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        toast.error('Authentication failed. Please login again.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch users');
        toast.error('Failed to load team members');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    // Navigate to user details page with user data
    navigate(`/team/member/${user._id || user.id}`, { 
      state: { user } 
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Team Members</h3>
          <p className="text-gray-500">Please wait while we fetch your team...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Users className="h-16 w-16 text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">Error Loading Team</h3>
          <p className="text-gray-500 max-w-md mb-4">{error}</p>
          <button
            onClick={fetchAllUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">No Team Members Found</h3>
          <p className="text-gray-500 max-w-md">
            There are no team members to display at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">My Team</h1>
        <p className="text-gray-600">
          {users.length} team member{users.length !== 1 ? 's' : ''} in your organization
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((user) => (
          <div
            key={user._id || user.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
            onClick={() => handleUserClick(user)}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || 'Profile'}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-white text-lg font-semibold ${
                    user.profilePicture ? 'hidden' : 'flex'
                  }`}
                >
                  {getInitials(user.name || user.username || user.email)}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {user.name || user.username || 'Unknown User'}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {user.designation || user.role || 'Team Member'}
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTeam;
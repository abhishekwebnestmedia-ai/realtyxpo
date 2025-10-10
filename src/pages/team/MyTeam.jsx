import React, { useState, useEffect } from 'react';
import { Users, Loader2, ArrowLeft, BriefcaseBusiness,  Building, NotepadTextDashedIcon, Info } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { ScrollableLeads } from '../../components/dashboard';
import ViewProfile from '../profile/ViewProfile';

const MyTeam = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentView, setCurrentView] = useState('team'); // 'team' or 'details'
  const [primaryOption, setPrimaryOption] = useState('Leads');
  const [secondaryOption, setSecondaryOption] = useState('All Buyers');
  const [userData, setUserData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && currentView === 'details') {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, primaryOption, secondaryOption, currentView]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/auth/teams');
      
      let usersData = [];
      if (response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      
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

  const fetchUserData = async () => {
    if (!selectedUser) return;
    
    setDataLoading(true);
    try {
      let response;
      const userName = selectedUser.name || selectedUser.username;
      
      if (primaryOption === 'Leads') {
        response = await api.get(`/realtleads/userbasedlead?name=${userName}`);
      } else if (primaryOption === 'Inventory') {
        response = await api.get(`/inventry/userbasedinventry?assignTo=${userName}`);
      } else {
        setUserData([]);
        setDataLoading(false);
        return;
      }
      
      let data = [];
      if (response.data.leads && Array.isArray(response.data.leads)) {
        data = response.data.leads;
      } else if (response.data.inventories && Array.isArray(response.data.inventories)) {
        data = response.data.inventories;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      
      const filteredData = filterDataBySecondaryOption(data);
      setUserData(filteredData);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error(`No ${primaryOption.toLowerCase()} found for this user`);
      } else {
        toast.error(`Failed to load ${primaryOption.toLowerCase()}: ${error.response?.data?.message || error.message}`);
      }
      setUserData([]);
    } finally {
      setDataLoading(false);
    }
  };

  const filterDataBySecondaryOption = (data) => {
    if (primaryOption === 'Leads') {
      switch (secondaryOption) {
        case 'All Buyers':
          return data.filter(item => item.leadType === 'Buyer');
        case 'Rental Business':
          return data.filter(item => item.leadType === 'Rental');
        case 'Completed Leads':
          return data.filter(item => item.status === 'completed' || item.status === 'closed');
        default:
          return data;
      }
    } else if (primaryOption === 'Inventory') {
      switch (secondaryOption) {
        case 'Sale':
          return data.filter(item => item.type === 'sale' || item.category === 'sale');
        case 'Rent':
          return data.filter(item => item.type === 'rent' || item.category === 'rent');
        case 'Completed Inventory':
          return data.filter(item => item.status === 'completed' || item.status === 'sold');
        default:
          return data;
      }
    }
    return data;
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setCurrentView('details');
    setPrimaryOption('Leads');
    setSecondaryOption('All Buyers');
    setUserData([]);
  };

  const handleBackToTeam = () => {
    setCurrentView('team');
    setSelectedUser(null);
    setUserData([]);
  };

  const getSecondaryOptions = () => {
    switch (primaryOption) {
      case 'Leads':
        return [
          { value: 'All Buyers', label: 'All Buyers' },
          { value: 'Rental Business', label: 'Rental Business' },
          { value: 'Completed Leads', label: 'Completed Leads' }
        ];
      case 'Inventory':
        return [
          { value: 'Sale', label: 'Sale' },
          { value: 'Rent', label: 'Rent' },
          { value: 'Completed Inventory', label: 'Completed Inventory' }
        ];
      default:
        return [];
    }
  };

  const handlePrimaryOptionChange = (option) => {
    setPrimaryOption(option);
    // Always reset to first option when switching primary option
    if (option === 'Leads') {
      setSecondaryOption('All Buyers');
    } else if (option === 'Inventory') {
      setSecondaryOption('Sale');
    } else {
      setSecondaryOption('');
    }
  };

  const primaryOptions = [
    { value: 'Leads', label: 'Leads', icon: BriefcaseBusiness },
    { value: 'Inventory', label: 'Inventory', icon: Building },
    { value: 'Daily Plan', label: 'Daily Plan', icon: NotepadTextDashedIcon },
    { value: 'Info', label: 'Info', icon: Info }
  ];

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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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

  // Team Members Screen
  if (currentView === 'team') {
    return (
      <div className="">
        <div className="">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">My Team</h1>

        </div>

        <div className="flex flex-wrap ">
          {users.map((user) => (
            <div
              key={user._id || user.id}
              className="p-6 cursor-pointer"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || 'Profile'}
                      className="w-[6.5rem] h-[6.5rem] rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-[6.5rem] h-[6.5rem] rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-semibold ${
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
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // User Details Screen
  return (
    <div className="">
      <button
        onClick={handleBackToTeam}
        className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Team
      </button>
      
      <div className=" mb-6">
        <div className="max-w-md">
          <ToggleSwitch
            value={primaryOption}
            options={primaryOptions}
            onChange={handlePrimaryOptionChange}
            size="md"
          />
        </div>

        {(primaryOption === 'Leads' || primaryOption === 'Inventory') && (
          <div className="max-w-lg">
            <ToggleSwitch
              value={secondaryOption}
              options={getSecondaryOptions()}
              onChange={setSecondaryOption}
              size="md"
            />
          </div>
        )}
      </div>

      <div className="">

        
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
            <span>Loading {primaryOption.toLowerCase()}...</span>
          </div>
        ) : primaryOption === 'Info' ? (
          <ViewProfile 
            profileUser={selectedUser}
            customHeading={`${selectedUser?.name || 'User'} Profile`}
            showEditButton={false}
          />
        ) : primaryOption === 'Leads' ? (
          <div className="max-h-96 overflow-y-auto">
            <ScrollableLeads 
              data={userData} 
              hideSearch={true}
              externalSearch=""
              externalRowsPerPage={5}
            />
          </div>
        ) : primaryOption === 'Inventory' ? (
          <div className="max-h-96 overflow-y-auto">
            {userData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-medium">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-medium">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-medium">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-medium">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userData.map((item, index) => (
                      <tr key={item._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.propertyName || item.title || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.type || item.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'available' ? 'bg-green-100 text-green-800' :
                            item.status === 'sold' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.price ? `₹${item.price.toLocaleString()}` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No inventory data found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {primaryOption} data will be available soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
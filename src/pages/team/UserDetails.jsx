import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { ScrollableLeads } from '../../components/dashboard';

const UserDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const [user, setUser] = useState(location.state?.user || null);
  const [primaryOption, setPrimaryOption] = useState('Leads');
  const [secondaryOption, setSecondaryOption] = useState('All Buyers');
  const [userData, setUserData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, primaryOption, secondaryOption]);

  // If user data is not passed via navigation state, fetch it
  useEffect(() => {
    if (!user && userId) {
      fetchUserById(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId]);

  const fetchUserById = async (id) => {
    try {
      const response = await api.get('/auth/teams');
      let usersData = [];
      
      if (response.data.users && Array.isArray(response.data.users)) {
        usersData = response.data.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        usersData = response.data.data;
      }
      
      const foundUser = usersData.find(u => u._id === id || u.id === id);
      if (foundUser) {
        setUser(foundUser);
      } else {
        toast.error('User not found');
        navigate('/team');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
      navigate('/team');
    }
  };

  const fetchUserData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      let response;
      const userName = user.name || user.username;
      
      console.log('Fetching data for user:', userName, 'Option:', primaryOption);
      
      if (primaryOption === 'Leads') {
        console.log('Making API call to: /realtleads/userbasedlead?name=' + userName);
        response = await api.get(`/realtleads/userbasedlead?name=${userName}`);
        console.log('Leads API response:', response.data);
      } else if (primaryOption === 'Inventory') {
        console.log('Making API call to: /inventry/userbasedinventry?assignTo=' + userName);
        response = await api.get(`/inventry/userbasedinventry?assignTo=${userName}`);
        console.log('Inventory API response:', response.data);
      } else {
        setUserData([]);
        setDataLoading(false);
        return;
      }
      
      let data = [];
      if (response.data.leads && Array.isArray(response.data.leads)) {
        data = response.data.leads;
        console.log('Found leads data:', data.length, 'items');
      } else if (response.data.inventories && Array.isArray(response.data.inventories)) {
        data = response.data.inventories;
        console.log('Found inventories data:', data.length, 'items');
      } else if (Array.isArray(response.data)) {
        data = response.data;
        console.log('Found direct array data:', data.length, 'items');
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
        console.log('Found nested data:', data.length, 'items');
      } else {
        console.log('No recognizable data structure found:', response.data);
      }
      
      const filteredData = filterDataBySecondaryOption(data);
      console.log('Filtered data:', filteredData.length, 'items after secondary filter');
      setUserData(filteredData);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message || error.message);
      
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
    const secondaryOptions = getSecondaryOptions();
    if (secondaryOptions.length > 0) {
      setSecondaryOption(secondaryOptions[0].value);
    }
  };

  const primaryOptions = [
    { value: 'Leads', label: 'Leads' },
    { value: 'Inventory', label: 'Inventory' },
    { value: 'Daily Plan', label: 'Daily Plan' },
    { value: 'Info', label: 'Info' }
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

  const handleBackToTeam = () => {
    navigate('/team');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading User Details</h3>
          <p className="text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={handleBackToTeam}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Team
        </button>
        
        <div className="flex items-center mb-6">
          <div className="mr-4">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name || 'Profile'}
                className="w-32 h-32 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center text-white text-lg font-semibold ${
                user.profilePicture ? 'hidden' : 'flex'
              }`}
            >
              {getInitials(user.name || user.username || user.email)}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-medium text-gray-900">
              {user.name || user.username || 'Unknown User'}
            </h1>
            <p className="text-gray-600">
              {user.designation || user.role || 'Team Member'}
            </p>
          </div>
        </div>

        {/* Toggle Switches */}
        <div className="space-y-6">
          {/* Primary Toggle Switch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Data Type
            </label>
            <ToggleSwitch
              value={primaryOption}
              options={primaryOptions}
              onChange={handlePrimaryOptionChange}
              size="md"
            />
          </div>

          {/* Secondary Toggle Switch - Only for Leads and Inventory */}
          {(primaryOption === 'Leads' || primaryOption === 'Inventory') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by {primaryOption}
              </label>
              <ToggleSwitch
                value={secondaryOption}
                options={getSecondaryOptions()}
                onChange={setSecondaryOption}
                size="md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Data Display */}
      <div className="">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {primaryOption} Data
          {(primaryOption === 'Leads' || primaryOption === 'Inventory') && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({secondaryOption})
            </span>
          )}
        </h2>
        
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
            <span>Loading {primaryOption.toLowerCase()}...</span>
          </div>
        ) : primaryOption === 'Leads' ? (
          <div className="max-h-96 overflow-y-auto">
            <ScrollableLeads 
              data={userData} 
              hideSearch={true}
              externalSearch=""
              externalRowsPerPage={10}
            />
          </div>
        ) : primaryOption === 'Inventory' ? (
          <div className="max-h-96 overflow-y-auto">
            {userData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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

export default UserDetails;
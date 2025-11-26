import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../api/api';
// Token is stored in localStorage now
import { toast } from 'react-hot-toast';
import { useTeamMembers } from '../../hooks/useTeamMembers';
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
    if (!user && userId && teamMembers) {
      fetchUserById(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userId, teamMembers]);

  // Use cached team members hook
  const { data: teamMembers } = useTeamMembers();

  const fetchUserById = (id) => {
    if (!teamMembers) return;
    
    const foundUser = teamMembers.find(u => u._id === id || u.id === id);
    if (foundUser) {
      setUser(foundUser);
    } else {
      toast.error('User not found');
      navigate('/team');
    }
  };

  // Simplified fetch logic: call the correct endpoint for the selected primaryOption
  const fetchUserData = async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const userName = user.name || user.username || '';
      let response;

      if (primaryOption === 'Leads') {
        // Leads endpoint requires Authorization header (token stored in localStorage)
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        response = await api.get('/realtleads/userbasedlead', { params: { name: userName }, headers });
      } else if (primaryOption === 'Inventory') {
        response = await api.get('/inventry/userbasedinventry', { params: { transferTo: userName } });
      } else {
        setUserData([]);
        return;
      }

      // Normalize response: backend may return array directly or wrapped object
      let data = [];
      if (Array.isArray(response.data)) data = response.data;
      else if (Array.isArray(response.data?.data)) data = response.data.data;
      else if (Array.isArray(response.data?.leads)) data = response.data.leads;
      else if (Array.isArray(response.data?.inventories)) data = response.data.inventories;

      // Apply secondary filter (simple, predictable rules)
      const filtered = filterDataBySecondaryOption(data || []);
      setUserData(filtered);
    } catch (err) {
      console.error('Failed to fetch user data', err?.response?.data || err.message || err);
      setUserData([]);
      if (err.response?.status === 401) toast.error('Authentication failed. Please login again.');
      else if (err.response?.status === 404) toast.error(`No ${primaryOption.toLowerCase()} found for this user`);
      else toast.error(`Failed to load ${primaryOption.toLowerCase()}`);
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
          return data.filter(item => {
            const kind = String(item.type || item.category || item.inventoryType || item.inventory_type || '').toLowerCase();
            return kind.includes('sale') || kind.includes('sales');
          });
        case 'Rent':
          return data.filter(item => {
            const kind = String(item.type || item.category || item.inventoryType || item.inventory_type || '').toLowerCase();
            return kind.includes('rent');
          });
        case 'Completed Inventory':
          return data.filter(item => String(item.status || '').toLowerCase() === 'completed' || String(item.status || '').toLowerCase() === 'sold');
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
    // Get secondary options based on the NEW option, not current state
    let secondaryOptions = [];
    switch (option) {
      case 'Leads':
        secondaryOptions = [
          { value: 'All Buyers', label: 'All Buyers' },
          { value: 'Rental Business', label: 'Rental Business' },
          { value: 'Completed Leads', label: 'Completed Leads' }
        ];
        break;
      case 'Inventory':
        secondaryOptions = [
          { value: 'Sale', label: 'Sale' },
          { value: 'Rent', label: 'Rent' },
          { value: 'Completed Inventory', label: 'Completed Inventory' }
        ];
        break;
      default:
        secondaryOptions = [];
    }
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

  const _getInitials = (name) => {
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
        
    

        {/* Toggle Switches */}
        <div className="space-y-8">
          {/* Primary Toggle Switch */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Data Type
            </h3>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filter by {primaryOption}
              </h3>
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
              externalRowsPerPage={5}
            />
          </div>
        ) : primaryOption === 'Inventory' ? (
          <div className="max-h-96 overflow-y-auto">
            {userData.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-tr-3xl rounded-tl-3xl">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10 font-bold">
                    <tr>
                      <th className="px-4 py-2 font-semibold text-center theading">S.No</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Seller Name</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Project</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Sector No</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Unit No</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Tower No</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Typology</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Size</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Demand</th>
                      <th className="px-4 py-2 whitespace-nowrap theading font-semibold">Contact No.</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Email</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Payment Status</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Registry Type</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Requirement</th>
                      <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.map((item, index) => (
                      <tr key={item._id || index} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-center">{index + 1}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.sellerName || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {Array.isArray(item.Project) ? item.Project.join(', ') : (item.Project || 'N/A')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.sector || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.unitNo || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.towerNo || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {Array.isArray(item.typology) ? item.typology.join(', ') : (item.typology || 'N/A')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.size || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.demand || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap flex flex-wrap gap-1">
                          {Array.isArray(item.contactNumbers) && item.contactNumbers.length > 0 ? 
                            item.contactNumbers.map((num, idx) => (
                              <span key={idx} className="text-[#020E4F] px-2 rounded-full text-sm">
                                {num}
                              </span>
                            )) : 'N/A'
                          }
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.email || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {Array.isArray(item.paymentStatus) ? item.paymentStatus.join(', ') : (item.paymentStatus || 'N/A')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.registryType || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.requirement || 'N/A'}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{item.date || 'N/A'}</td>
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
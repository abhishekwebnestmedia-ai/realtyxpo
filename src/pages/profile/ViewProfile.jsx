import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Edit2, User, Fingerprint, Mail, Smartphone, IdCardIcon, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Chart from 'react-apexcharts';
import api from '../../api/api';
// token is read from localStorage

const ViewProfile = ({ profileUser = null, customHeading = null, showEditButton = true, showDeleteButton = false, onDelete = null, deleting = false }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Use passed profileUser or fallback to current user
  const displayUser = profileUser || user;

  // Function to display data or "NA" if not available
  const displayValue = (value, fallback = 'NA') => {
    return value && value.trim() !== '' ? value : fallback;
  };

  // Function to get full image URL
  // Function to get full image URL. If imagePath is not provided, try common user image fields.
  const getImageUrl = (imagePath) => {
    let path = imagePath;
    if (!path) {
      // Try common fields on displayUser
      path = displayUser?.profileImage || displayUser?.profilePicture || displayUser?.avatar || displayUser?.profilePhoto;
    }
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://backend.realtyxpo.in${path}`;
  };

  // Compute profile src once so JSX can use it
  const profileSrc = getImageUrl();

  // Mock data for leads with useMemo to prevent re-renders
  const mockLeadsData = useMemo(() => [
    { _id: '1', customerName: 'John Doe', status: 'Hot', createdAt: '2024-09-15T10:30:00.000Z' },
    { _id: '2', customerName: 'Jane Smith', status: 'Warm', createdAt: '2024-10-02T14:20:00.000Z' },
    { _id: '3', customerName: 'Bob Johnson', status: 'Cold', createdAt: '2024-08-25T09:15:00.000Z' },
    { _id: '4', customerName: 'Alice Brown', status: 'Hot', createdAt: '2024-09-28T16:45:00.000Z' },
    { _id: '5', customerName: 'Charlie Wilson', status: 'Warm', createdAt: '2024-10-05T11:30:00.000Z' },
    { _id: '6', customerName: 'Diana Prince', status: 'Hot', createdAt: '2024-10-08T13:20:00.000Z' },
    { _id: '7', customerName: 'Edward King', status: 'Cold', createdAt: '2024-07-18T08:10:00.000Z' },
    { _id: '8', customerName: 'Fiona Green', status: 'Warm', createdAt: '2024-09-12T12:00:00.000Z' },
    { _id: '9', customerName: 'George Miller', status: 'Dead Lead', createdAt: '2024-09-10T10:30:00.000Z' },
    { _id: '10', customerName: 'Helen Davis', status: 'Dead Lead', createdAt: '2024-09-22T14:20:00.000Z' },
    { _id: '11', customerName: 'Ivan Clark', status: 'Dead Lead', createdAt: '2024-10-01T09:15:00.000Z' },
    { _id: '12', customerName: 'Julia Roberts', status: 'Dead Lead', createdAt: '2024-10-04T16:45:00.000Z' }
  ], []);

  // Mock data for inventory
  const mockInventoryData = [
    { _id: '1', sellerName: 'Property A', inventoryType: 'Sales', status: 'Available', createdAt: '2024-09-20T10:00:00.000Z' },
    { _id: '2', sellerName: 'Property B', inventoryType: 'Rent', status: 'Available', createdAt: '2024-10-01T14:30:00.000Z' },
    { _id: '3', sellerName: 'Property C', inventoryType: 'Sales', status: 'Sold', createdAt: '2024-08-15T09:45:00.000Z' },
    { _id: '4', sellerName: 'Property D', inventoryType: 'Rent', status: 'Rented', createdAt: '2024-09-25T16:20:00.000Z' },
    { _id: '5', sellerName: 'Property E', inventoryType: 'Sales', status: 'Available', createdAt: '2024-10-03T11:15:00.000Z' },
    { _id: '6', sellerName: 'Property F', inventoryType: 'Rent', status: 'Available', createdAt: '2024-07-28T13:40:00.000Z' },
    { _id: '7', sellerName: 'Property G', inventoryType: 'Sales', status: 'Sold', createdAt: '2024-09-15T10:30:00.000Z' },
    { _id: '8', sellerName: 'Property H', inventoryType: 'Rent', status: 'Rented', createdAt: '2024-10-02T14:20:00.000Z' }
  ];

  const [leadsData, setLeadsData] = useState([]);
  const [inventoryData, setInventoryData] = useState(mockInventoryData);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7d'); // Default to 7 days
  const [showLeadsDropdown, setShowLeadsDropdown] = useState(false);
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false);

  // Date range options
  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Function to get date range for API calls
  const getDateRange = (range) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(today.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(today.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(today.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case 'all':
        return null; // No date filter for all time
      default:
        startDate.setDate(today.getDate() - 7);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  };

  // Function to fetch leads data from API
  const fetchLeadsData = useCallback(async () => {
    try {
      setLoading(true);
      const userName = displayUser?.name || displayUser?.userName;
      if (!userName) return;

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const response = await api.get('/realtleads/userbasedlead', { params: { name: userName }, headers });
      let data = [];
      console.log('response', response)
      if (response.data.leads && Array.isArray(response.data.leads)) {
        data = response.data.leads;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }

      // Filter by date range
      const dateFilter = getDateRange(dateRange);
      if (dateFilter) {
        data = data.filter(lead => {
          const leadDate = new Date(lead.createdAt || lead.date);
          const filterStart = new Date(dateFilter.startDate);
          const filterEnd = new Date(dateFilter.endDate);
          return leadDate >= filterStart && leadDate <= filterEnd;
        });
      }

      setLeadsData(data);
    } catch (error) {
      console.log('Using mock data for leads. API Error:', error.message);
      setLeadsData(mockLeadsData.slice(0, 8)); // Use subset of mock data
    } finally {
      setLoading(false);
    }
  }, [displayUser?.name, displayUser?.userName, dateRange, mockLeadsData]);

  // Function to fetch user-based inventory from API
  const fetchUserInventory = useCallback(async () => {
    try {
      if (displayUser?.userName || displayUser?.name) {
        const userName = displayUser?.userName || displayUser?.name;
  const response = await api.get('/inventry/userbasedinventry', { params: { transferTo: userName } });
        
        if (response.data && Array.isArray(response.data)) {
          let data = response.data;
          
          // Filter by date range
          const dateFilter = getDateRange(dateRange);
          if (dateFilter) {
            data = data.filter(item => {
              const itemDate = new Date(item.createdAt || item.date);
              const filterStart = new Date(dateFilter.startDate);
              const filterEnd = new Date(dateFilter.endDate);
              return itemDate >= filterStart && itemDate <= filterEnd;
            });
          }

          // Transform API data to match our structure
          const transformedData = data.map(item => ({
            _id: item._id,
            sellerName: item.propertyName || item.sellerName || 'Unknown Property',
            inventoryType: item.inventoryType || 'Sales',
            status: item.status || 'Available',
            createdAt: item.createdAt || new Date().toISOString()
          }));
          setInventoryData(transformedData);
        }
      }
    } catch (error) {
      console.log('Using mock data for inventory. API Error:', error.message);
      // Keep using mock data if API fails
    }
  }, [displayUser?.userName, displayUser?.name, dateRange]);

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    fetchLeadsData();
    fetchUserInventory();
  }, [dateRange, fetchLeadsData, fetchUserInventory]);

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowLeadsDropdown(false);
        setShowInventoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to process leads data by date
  const processLeadsDataByDate = (leads) => {
    const dateCounts = {};
    
    leads.forEach(lead => {
      const date = new Date(lead.createdAt);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    
    const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b));
    return {
      categories: sortedDates.slice(-10), // Last 10 dates
      data: sortedDates.slice(-10).map(date => dateCounts[date] || 0)
    };
  };

  // Function to process inventory data by date
  const processInventoryDataByDate = (inventory) => {
    const dateCounts = {};
    
    inventory.forEach(item => {
      const date = new Date(item.createdAt);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });
    
    const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b));
    return {
      categories: sortedDates.slice(-10), // Last 10 dates
      data: sortedDates.slice(-10).map(date => dateCounts[date] || 0)
    };
  };

  // Process the data for charts
  const leadsChartData = processLeadsDataByDate(leadsData);
  const inventoryChartData = processInventoryDataByDate(inventoryData);

  // Chart configuration for Leads
  const leadsChartOptions = {
    chart: {
      type: 'area',
      height: 200,
      sparkline: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    colors: ['#8B5CF6'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: leadsChartData.categories.length > 0 ? leadsChartData.categories.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }) : ['No Data'],
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 400
        },
        rotate: -45
      }
    },
    yaxis: {
      title: {
        text: 'Number of Leads',
        style: {
          fontSize: '14px',
          fontWeight: 400
        }
      }
    },
    grid: {
      show: true,
      strokeDashArray: 3
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val) {
          return val + ' leads';
        }
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  const leadsChartSeries = [{
    name: 'Leads Captured',
    data: leadsChartData.data.length > 0 ? leadsChartData.data : [0]
  }];

  // Chart configuration for Inventory
  const inventoryChartOptions = {
    chart: {
      type: 'area',
      height: 200,
      sparkline: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    colors: ['#10B981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: inventoryChartData.categories.length > 0 ? inventoryChartData.categories.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }) : ['No Data'],
      labels: {
        style: {
          fontSize: '14px',
          fontWeight: 400
        },
        rotate: -45
      }
    },
    yaxis: {
      title: {
        text: 'Number of Inventory',
        style: {
          fontSize: '14px',
          fontWeight: 400
        }
      }
    },
    grid: {
      show: true,
      strokeDashArray: 3
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function(val) {
          return val + ' inventory';
        }
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  const inventoryChartSeries = [{
    name: 'Inventory Captured',
    data: inventoryChartData.data.length > 0 ? inventoryChartData.data : [0]
  }];

  // Calculate leads closed (dead leads) data for SVG meter
  const deadLeadsCount = leadsData.filter(lead => lead.status === 'Dead Lead').length;
  const totalLeads = leadsData.length;
  const deadLeadsPercentage = totalLeads > 0 ? (deadLeadsCount / totalLeads) * 100 : 0;

  // Calculate inventory sold/rented data for SVG meter
  const soldInventoryCount = inventoryData.filter(item => item.status === 'Sold' || item.status === 'Rented').length;
  const totalInventory = inventoryData.length;
  const soldInventoryPercentage = totalInventory > 0 ? (soldInventoryCount / totalInventory) * 100 : 0;

  // SVG Meter Component for Leads Closed
  const SVGMeter = ({ percentage, value, total, title }) => {
    const radius = 60;
    const strokeWidth = 8;
    const center = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="140" height="140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#3B82F6"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">of {total}</div>
            <div className="text-xs text-blue-600 font-medium">{percentage.toFixed(1)}%</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">Closed Leads</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-medium text-gray-900">
            {customHeading || 'Profile'}
          </h1>
          <div className="flex items-center gap-3">
            {showEditButton && (
              <button 
                onClick={() => navigate('/profile/edit')}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
                <span className="text-sm font-medium">Edit</span>
              </button>
            )}
            {showDeleteButton && (
              <button
                onClick={onDelete}
                disabled={deleting}
                className="flex items-center space-x-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                title="Delete user"
              >
                <span className="text-sm font-medium">{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Card and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <div className=" rounded-xl  ">
              {/* Profile Image */}
              <div className="rounded-xl p-6 mb-6 text-center">
                {profileSrc ? (
                  <img
                    src={profileSrc}
                    alt="Profile"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4 border-4 border-gray-200">
                    <span className="text-2xl font-bold text-white">
                      {getInitials(displayUser?.name)}
                    </span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {displayValue(displayUser?.name)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {displayValue(displayUser?.designation || displayUser?.role)}
                </p>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <User size={20} color='white' />
                  </div>
                  <div>
                    <p className="text-base text-gray-500">{displayValue(displayUser?.name)}</p>
                    <p className="text-sm text-gray-900">Name</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <IdCardIcon size={20} color='white'/>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">{displayValue(displayUser?.designation || displayUser?.role)}</p>
                    <p className="text-sm font-medium text-gray-900">Designation</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <Fingerprint size={20} color='white'/>
                  </div>
                  <div>
                    <p className="text-base text-gray-500">{displayValue(displayUser?.empid || displayUser?.employeeId)}</p>
                    <p className="text-sm font-medium text-gray-900">Employee ID</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <Mail size={20} color='white'/>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className="text-base text-gray-500 truncate">{displayValue(displayUser?.email)}</p>  
                    <p className="text-sm font-medium text-gray-900">Email</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <Smartphone size={20} color='white'/>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{displayValue(displayUser?.phoneNumber || displayUser?.phone)}</p>
                    <p className="text-sm font-medium text-gray-900">Phone No.</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#334DE5] rounded-lg flex items-center justify-center">
                    <User size={20} color='white'/>
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className="text-base text-gray-500 truncate">{displayValue(displayUser?.address)}</p>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Charts */}
          <div className="lg:col-span-3 space-y-6 gap-10">
            {/* Leads Section */}
            <div className=" rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-medium text-gray-900">Leads</h3>
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowLeadsDropdown(!showLeadsDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'All Time'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showLeadsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showLeadsDropdown && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {dateRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleDateRangeChange(option.value);
                            setShowLeadsDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                            dateRange === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">
                      Leads Captured: {loading ? 'Loading...' : leadsData.length}
                    </span>
                  </div>
                  <div className="h-48">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">Loading chart...</span>
                      </div>
                    ) : (
                      <Chart 
                        options={leadsChartOptions} 
                        series={leadsChartSeries} 
                        type="area" 
                        height="100%" 
                      />
                    )}
                  </div>
                </div>

                {/* SVG Meter for Leads Closed */}
                <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <SVGMeter
                      percentage={deadLeadsPercentage}
                      value={deadLeadsCount}
                      total={totalLeads}
                      title="Leads Closed"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Inventory Section */}
            <div className="">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-medium text-gray-900">Inventory</h3>
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowInventoryDropdown(!showInventoryDropdown)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {dateRangeOptions.find(opt => opt.value === dateRange)?.label || 'All Time'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showInventoryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showInventoryDropdown && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {dateRangeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleDateRangeChange(option.value);
                            setShowInventoryDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                            dateRange === option.value ? 'bg-green-50 text-green-600' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">
                      Inventory Captured: {loading ? 'Loading...' : inventoryData.length}
                    </span>
                  </div>
                  <div className="h-48">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-500">Loading chart...</span>
                      </div>
                    ) : (
                      <Chart 
                        options={inventoryChartOptions} 
                        series={inventoryChartSeries} 
                        type="area" 
                        height="100%" 
                      />
                    )}
                  </div>
                </div>

                {/* SVG Meter for Inventory Sold/Rented */}
                <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <SVGMeter
                      percentage={soldInventoryPercentage}
                      value={soldInventoryCount}
                      total={totalInventory}
                      title="Inventory Sold"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
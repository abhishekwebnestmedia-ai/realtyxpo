import React, { useState } from 'react';
import { Home, ChevronRight, Folder, File, Building2 } from 'lucide-react';

// Custom Components
import { ToggleSwitch } from '../../components/ui';

/**
 * ProjectsWorking Component - Static Version
 * 
 * Features:
 * - Static hierarchical project display
 * - Filter by project type and construction status
 * - Static navigation
 * - Responsive design
 */
const ProjectsWorking = () => {
  // State Management
  const [filters, setFilters] = useState({
    projectType: 'Commercial',
    constructionStatus: 'ReadyToMove'
  });

  const [currentPath, setCurrentPath] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('cities');

  // Static data structure
  const staticData = {
    'Commercial-ReadyToMove': {
      cities: [
        { _id: '1', name: 'Mumbai', cityName: 'Mumbai' },
        { _id: '2', name: 'Delhi', cityName: 'Delhi' },
        { _id: '3', name: 'Bangalore', cityName: 'Bangalore' },
        { _id: '4', name: 'Pune', cityName: 'Pune' }
      ],
      divisions: {
        '1': [
          { _id: 'd1', name: 'Central Mumbai', divisionName: 'Central Mumbai' },
          { _id: 'd2', name: 'South Mumbai', divisionName: 'South Mumbai' }
        ]
      },
      sectors: {
        'd1': [
          { _id: 's1', name: 'BKC', sectorName: 'BKC' },
          { _id: 's2', name: 'Lower Parel', sectorName: 'Lower Parel' }
        ]
      },
      projects: {
        's1': [
          { _id: 'p1', name: 'BKC Tower', projectName: 'BKC Tower' },
          { _id: 'p2', name: 'Commercial Hub', projectName: 'Commercial Hub' }
        ]
      },
      towers: {
        'p1': [
          { _id: 't1', name: 'Tower A', towerName: 'Tower A' },
          { _id: 't2', name: 'Tower B', towerName: 'Tower B' }
        ]
      },
      units: {
        't1': [
          { _id: 'u1', unitNumber: '101', ownerName: 'John Doe', status: 'vacant', email: 'john@example.com' },
          { _id: 'u2', unitNumber: '102', ownerName: 'Jane Smith', status: 'rental', email: 'jane@example.com' },
          { _id: 'u3', unitNumber: '103', ownerName: 'Bob Wilson', status: 'interested in selling', email: 'bob@example.com' },
          { _id: 'u4', unitNumber: '104', ownerName: 'Alice Brown', status: 'self occupied', email: 'alice@example.com' },
          { _id: 'u5', unitNumber: '105', ownerName: 'Tom Davis', status: '', email: 'tom@example.com' }
        ]
      }
    },
    'Residential-UnderConstruction': {
      cities: [
        { _id: '5', name: 'Gurgaon', cityName: 'Gurgaon' },
        { _id: '6', name: 'Noida', cityName: 'Noida' },
        { _id: '7', name: 'Hyderabad', cityName: 'Hyderabad' }
      ],
      divisions: {
        '5': [
          { _id: 'd3', name: 'Sector 49', divisionName: 'Sector 49' },
          { _id: 'd4', name: 'Golf Course Road', divisionName: 'Golf Course Road' }
        ]
      },
      sectors: {
        'd3': [
          { _id: 's3', name: 'Phase 1', sectorName: 'Phase 1' },
          { _id: 's4', name: 'Phase 2', sectorName: 'Phase 2' }
        ]
      },
      projects: {
        's3': [
          { _id: 'p3', name: 'Residential Heights', projectName: 'Residential Heights' },
          { _id: 'p4', name: 'Green Valley', projectName: 'Green Valley' }
        ]
      },
      towers: {
        'p3': [
          { _id: 't3', name: 'Block A', towerName: 'Block A' },
          { _id: 't4', name: 'Block B', towerName: 'Block B' }
        ]
      },
      units: {
        't3': [
          { _id: 'u6', unitNumber: '201', ownerName: 'Mike Johnson', status: 'vacant', email: 'mike@example.com' },
          { _id: 'u7', unitNumber: '202', ownerName: 'Sarah Wilson', status: 'rental', email: 'sarah@example.com' },
          { _id: 'u8', unitNumber: '203', ownerName: 'David Chen', status: 'interested in selling', email: 'david@example.com' },
          { _id: 'u9', unitNumber: '204', ownerName: 'Lisa Park', status: 'self occupied', email: 'lisa@example.com' },
          { _id: 'u10', unitNumber: '205', ownerName: 'Ryan Miller', status: '', email: 'ryan@example.com' }
        ]
      }
    }
  };

  // Get current data key
  const getDataKey = () => `${filters.projectType}-${filters.constructionStatus}`;

  // Get status color for units
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'vacant':
        return 'bg-white border-2 border-gray-400 text-gray-800';
      case 'rental':
        return 'bg-green-500 text-white';
      case 'interested in selling':
        return 'bg-red-500 text-white';
      case 'self occupied':
        return 'bg-yellow-500 text-gray-800';
      default:
        return 'bg-gray-400 text-white'; // No status assigned
    }
  };

  // Get current level data
  const getCurrentLevelData = () => {
    const dataKey = getDataKey();
    const data = staticData[dataKey];
    
    if (!data) return [];

    switch (currentLevel) {
      case 'cities':
        return data.cities || [];
      case 'divisions': {
        const cityId = currentPath[0]?.id;
        return data.divisions?.[cityId] || [];
      }
      case 'sectors': {
        const divisionId = currentPath[1]?.id;
        return data.sectors?.[divisionId] || [];
      }
      case 'projects': {
        const sectorId = currentPath[2]?.id;
        return data.projects?.[sectorId] || [];
      }
      case 'towers': {
        const projectId = currentPath[3]?.id;
        return data.towers?.[projectId] || [];
      }
      case 'units': {
        const towerId = currentPath[4]?.id;
        return data.units?.[towerId] || [];
      }
      default:
        return [];
    }
  };

  // Icon selection based on project type and construction status
  const getProjectIcon = () => {
    const { projectType, constructionStatus } = filters;
    
    if (projectType === 'Residential' && constructionStatus === 'ReadyToMove') {
      return '/project-working/icon1.svg';
    } else if (projectType === 'Commercial' && constructionStatus === 'UnderConstruction') {
      return '/project-working/icon2.svg';
    } else if (projectType === 'Residential' && constructionStatus === 'UnderConstruction') {
      return '/project-working/icon3.svg';
    } else if (projectType === 'Commercial' && constructionStatus === 'ReadyToMove') {
      return '/project-working/icon4.svg';
    }
    
    return '/project-working/icon1.svg';
  };

  // Get level configuration
  const getLevelConfig = () => {
    const configs = {
      cities: {
        title: 'Cities',
        getItemName: (item) => item.cityName || item.name
      },
      divisions: {
        title: 'Divisions',
        getItemName: (item) => item.divisionName || item.name
      },
      sectors: {
        title: 'Sectors',
        getItemName: (item) => item.sectorName || item.name
      },
      projects: {
        title: 'Projects',
        getItemName: (item) => item.projectName || item.name
      },
      towers: {
        title: 'Towers',
        getItemName: (item) => item.towerName || item.name
      },
      units: {
        title: 'Units',
        getItemName: (item) => item.unitNumber || item.name
      }
    };
    return configs[currentLevel] || configs.cities;
  };

  // Event Handlers
  const handleProjectTypeChange = (value) => {
    setFilters(prev => ({ ...prev, projectType: value }));
    setCurrentPath([]);
    setCurrentLevel('cities');
  };

  const handleConstructionStatusChange = (value) => {
    setFilters(prev => ({ ...prev, constructionStatus: value }));
    setCurrentPath([]);
    setCurrentLevel('cities');
  };

  const handleNavigateBack = (index) => {
    if (index === -1) {
      setCurrentPath([]);
      setCurrentLevel('cities');
    } else {
      const newPath = currentPath.slice(0, index + 1);
      setCurrentPath(newPath);
      const levels = ['cities', 'divisions', 'sectors', 'projects', 'towers', 'units'];
      setCurrentLevel(levels[newPath.length] || 'cities');
    }
  };

  const handleNavigateToItem = (item) => {
    if (currentLevel === 'units') return;

    const levels = ['cities', 'divisions', 'sectors', 'projects', 'towers', 'units'];
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[currentIndex + 1];
    
    if (nextLevel) {
      setCurrentPath(prev => [...prev, { id: item._id, name: item.name }]);
      setCurrentLevel(nextLevel);
    }
  };

  // Helper Functions
  const getConstructionStatusLabel = (status) => {
    return status === 'ReadyToMove' ? 'Ready To Move' : 
           status === 'UnderConstruction' ? 'Under Construction' : status;
  };

  const renderFilterSection = () => (
    <div className="mb-6">
      <h1 className="pageheading mb-4">Projects Working</h1>
      
      {currentLevel === 'cities' && (
        <div className="flex flex-wrap gap-6 mb-4">
          <div className="flex flex-col space-y-2">
            <ToggleSwitch
              value={filters.projectType}
              options={[
                { value: 'Commercial', label: 'Commercial' },
                { value: 'Residential', label: 'Residential' }
              ]}
              onChange={handleProjectTypeChange}
              size="md"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <ToggleSwitch
              value={filters.constructionStatus}
              options={[
                { value: 'ReadyToMove', label: 'Ready To Move' },
                { value: 'UnderConstruction', label: 'Under Construction' }
              ]}
              onChange={handleConstructionStatusChange}
              size="md"
              className="w-[22rem]"
            />
          </div>
        </div>
      )}

      {/* Status Legend for Units */}
      {currentLevel === 'units' && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Unit Status Legend:</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-400 rounded"></div>
              <span>Vacant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Rental</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Interested in Selling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Self Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>No Status</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBreadcrumbs = () => (
    <div className="flex items-center space-x-2 mb-4 rounded-lg">
      <button
        onClick={() => handleNavigateBack(-1)}
        className="flex items-center text-gray-700 hover:text-blue-800 transition-colors"
        aria-label="Navigate to home"
      >
        <Home className="h-4 w-4" />
      </button>
      
      {currentPath.map((pathItem, index) => (
        <React.Fragment key={pathItem.id}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <button
            onClick={() => handleNavigateBack(index)}
            className="text-gray-700 hover:text-blue-800 text-sm transition-colors"
          >
            {pathItem.name}
          </button>
        </React.Fragment>
      ))}
      
      {currentPath.length > 0 && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {getLevelConfig().title}
          </span>
        </>
      )}
    </div>
  );

  const renderItemGrid = () => {
    const currentLevelData = getCurrentLevelData();
    const levelConfig = getLevelConfig();

    if (currentLevelData.length === 0) {
      return (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">
            No projects found for {filters.projectType} projects with {getConstructionStatusLabel(filters.constructionStatus)} status.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-4">
        {currentLevelData.map((item) => (
          <div
            key={item._id}
            onDoubleClick={() => handleNavigateToItem(item)}
            className="w-32  rounded-lg cursor-pointer transition-colors group hover:bg-gray-50 "
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigateToItem(item);
              }
            }}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-1 h-full p-2">
              {currentLevel === 'units' ? (
                <div className={`w-16 h-12 rounded ${getStatusColor(item.status)} flex items-center justify-center`}>
                  <span className="text-xs font-medium">
                    {item.unitNumber}
                  </span>
                </div>
              ) : currentLevel === 'cities' ? (
                <img 
                  src={getProjectIcon()} 
                  alt={`${filters.projectType} ${filters.constructionStatus} icon`}
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              ) : (
                <div className="w-16 h-12 bg-blue-100 border-2 border-blue-300 rounded flex items-center justify-center">
                  <Folder className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <Folder className="h-6 w-6 text-blue-500" style={{display: 'none'}} />

              <h3 className="font-medium text-center text-gray-900 text-xl leading-tight truncate max-w-full">
                {levelConfig.getItemName(item)}
              </h3>

              {currentLevel === 'units' && (
                <div className="text-xs text-gray-600 mt-1 space-y-0.5 text-center">
                  <p className="truncate">Owner: {item.ownerName}</p>
                  <p className="truncate">Status: {item.status}</p>
                  <p className="truncate">Email: {item.email}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main Render
  return (
    <div className="">
      {renderFilterSection()}
      {currentLevel !== 'cities' && renderBreadcrumbs()}

      <div className="flex flex-row">
        {renderItemGrid()}
      </div>
    </div>
  );
};

export default ProjectsWorking;


import React, { useState } from 'react';
import { Home, ChevronRight, Folder, File, Building2, Plus } from 'lucide-react';

// Custom Components
import { ToggleSwitch } from '../../components/ui';
import AnimatedFolder from '../../components/ui/AnimatedFolder';
import { ProjectModal } from '../../components/modals';
import { toast } from 'react-hot-toast';
import useProjects from '../../hooks/useProjects';

/**
 * ProjectsWorking Component - Dynamic Version
 * 
 * Features:
 * - Dynamic hierarchical project display from API
 * - Filter by project type and construction status
 * - Real-time data fetching
 * - Responsive design with loading states
 */
const ProjectsWorking = () => {
  // State Management
  const [filters, setFilters] = useState({
    projectType: 'Commercial',
    constructionStatus: 'ReadyToMove'
  });

  const [currentPath, setCurrentPath] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('cities');
  
  // Use custom hook for data fetching
  const { data: projectData, loading, error, refresh } = useProjects(filters);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current path for pre-filling modal
  const getCurrentPath = () => {
    const pathData = {
      // Always include current filters
      category: filters.projectType,
      projectcategory: filters.constructionStatus
    };
    
    // Add path-specific data based on current level
    if (currentPath.length > 0) {
      if (currentPath[0]) pathData.cityName = currentPath[0].name;
      if (currentPath[1]) pathData.divisionName = currentPath[1].name;
      if (currentPath[2]) pathData.sectorName = currentPath[2].name;
      if (currentPath[3]) pathData.projectName = currentPath[3].name;
      if (currentPath[4]) pathData.towerName = currentPath[4].name;
    }
    
    return pathData;
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

  // Get status color for units only
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'vacant':
        return {
          tipColor: '#4b5563',
          coverColor: '#4b5563'
        };
      case 'rental':
        return {
          tipColor: '#22c55e',
          coverColor: '#22c55e'
        };
      case 'interested in selling':
        return {
          tipColor: '#ef4444',
          coverColor: '#ef4444'
        };
      case 'self occupied':
        return {
          tipColor: '#eab308',
          coverColor: '#eab308'
        };
      default:
        return {
          tipColor: '#6b7280',
          coverColor: '#6b7280'
        };
    }
  };

  // Get current level data
  const getCurrentLevelData = () => {
    if (!projectData) return [];

    switch (currentLevel) {
      case 'cities':
        return projectData.cities || [];
      case 'divisions': {
        const cityId = currentPath[0]?.id;
        return projectData.divisions?.[cityId] || [];
      }
      case 'sectors': {
        const divisionId = currentPath[1]?.id;
        return projectData.sectors?.[divisionId] || [];
      }
      case 'projects': {
        const sectorId = currentPath[2]?.id;
        return projectData.projects?.[sectorId] || [];
      }
      case 'towers': {
        const projectId = currentPath[3]?.id;
        return projectData.towers?.[projectId] || [];
      }
      case 'units': {
        const towerId = currentPath[4]?.id;
        return projectData.units?.[towerId] || [];
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
    <div className="">
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

    // Loading state
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Projects...</h3>
          <p className="text-gray-500">Fetching data from server</p>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }

    // No data state - but still show Add button
    if (currentLevelData.length === 0) {
      return (
        <div className="w-full min-h-[70vh] relative">
          {/* Add Button - Left Aligned at Top */}
          <div className="flex justify-start mt-6">
            <div
              onClick={() => setIsModalOpen(true)}
              className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              role="button"
              tabIndex={0}
            >
              <div className="w-24 h-20 flex items-center justify-center mb-2">
                <img src="/public/AddIcon.svg" alt="" className="w-22 h-22" />
              </div>
              <h3 className='text-xl text-center font-medium leading-tight min-h-12'>Add New Project</h3>
            </div>
          </div>
          
          {/* No Data Message - Vertically Centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">No Data Available</h3>
              <p className="text-gray-500 max-w-md">
                No projects found for {filters.projectType} projects with {getConstructionStatusLabel(filters.constructionStatus)} status.
              </p>
              <p className="text-blue-600 text-sm mt-4">
                Click the button above to add your first project!
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-4 mt-6">
        {/* Plus Icon for Adding New Items */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center"
          role="button"
          tabIndex={0}
        >
          <div className="w-24 h-20 flex items-center justify-center mb-2">
            <img src="/public/AddIcon.svg" alt="" className="w-22 h-22" />
          </div>
          <h3 className='text-xl text-center font-medium leading-tight min-h-12'>Add New Project</h3>
        </div>

        {/* Existing Items */}
        {currentLevelData.map((item) => (
          <div
            key={item._id}
            onDoubleClick={() => handleNavigateToItem(item)}
            className="w-32 h-40 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleNavigateToItem(item);
              }
            }}
          >
            {currentLevel === 'units' ? (
              <div className="w-24 h-20 flex items-center justify-center mb-2">
                <AnimatedFolder 
                  tipColor={getStatusColor(item.status).tipColor}
                  coverColor={getStatusColor(item.status).coverColor}
                />
              </div>
            ) : currentLevel === 'cities' ? (
              <div className="w-24 h-20 flex items-center justify-center mb-2">
                <img 
                  src={getProjectIcon()} 
                  alt={`${filters.projectType} ${filters.constructionStatus} icon`}
                  className="w-22 h-22"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
              </div>
            ) : (
              // AnimatedFolder for divisions, sectors, projects, towers
              <div className="w-24 h-20 flex items-center justify-center mb-2">
                <AnimatedFolder />
              </div>
            )}
            <Folder className="h-6 w-6 text-blue-500" style={{display: 'none'}} />

            <h3 className="font-medium text-center text-gray-900 text-xl leading-tight min-h-12">
              {currentLevel === 'units' ? item.unitNumber : levelConfig.getItemName(item)}
            </h3>
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

      <div className="flex flex-row ">
        {renderItemGrid()}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLevel={currentLevel}
        currentPath={getCurrentPath()}
        onSuccess={() => {
          // Refresh data after successful project creation
          refresh();
          setIsModalOpen(false);
          toast.success('Project created successfully!');
        }}
      />
    </div>
  );
};

export default ProjectsWorking;


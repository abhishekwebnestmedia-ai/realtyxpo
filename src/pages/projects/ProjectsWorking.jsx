


import React, { useState } from 'react';
import { Home, ChevronRight, Folder, File, Building2, Plus } from 'lucide-react';

// Custom Components
import { ToggleSwitch } from '../../components/ui';
import AnimatedFolder from '../../components/ui/AnimatedFolder';
import { ProjectModal } from '../../components/modals';
import UnitInfoModal from '../../components/modals/UnitInfomodal'; // ✅ FIXED import
import { toast } from 'react-hot-toast';
import useProjects from '../../hooks/useProjects';

const ProjectsWorking = () => {
  // State Management
  const [filters, setFilters] = useState({
    projectType: 'Commercial',
    constructionStatus: 'ReadyToMove',
  });

  const [currentPath, setCurrentPath] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('cities');

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  // Use custom hook for data fetching
  const { data: projectData, loading, error, refresh } = useProjects(filters);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current path for pre-filling modal
  const getCurrentPath = () => {
    const pathData = {
      category: filters.projectType,
      projectcategory: filters.constructionStatus,
    };

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
    setFilters((prev) => ({ ...prev, projectType: value }));
    setCurrentPath([]);
    setCurrentLevel('cities');
  };

  const handleConstructionStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, constructionStatus: value }));
    setCurrentPath([]);
    setCurrentLevel('cities');
  };

  // Get status color for units only
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'vacant':
        return { tipColor: '#4b5563', coverColor: '#4b5563' };
      case 'rental':
        return { tipColor: '#22c55e', coverColor: '#22c55e' };
      case 'interested in selling':
        return { tipColor: '#ef4444', coverColor: '#ef4444' };
      case 'self occupied':
        return { tipColor: '#eab308', coverColor: '#eab308' };
      default:
        return { tipColor: '#6b7280', coverColor: '#6b7280' };
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

    if (projectType === 'Residential' && constructionStatus === 'ReadyToMove')
      return '/project-working/icon1.svg';
    if (projectType === 'Commercial' && constructionStatus === 'UnderConstruction')
      return '/project-working/icon2.svg';
    if (projectType === 'Residential' && constructionStatus === 'UnderConstruction')
      return '/project-working/icon3.svg';
    if (projectType === 'Commercial' && constructionStatus === 'ReadyToMove')
      return '/project-working/icon4.svg';

    return '/project-working/icon1.svg';
  };

  // Level configuration
  const getLevelConfig = () => {
    const configs = {
      cities: { title: 'Cities', getItemName: (i) => i.cityName || i.name },
      divisions: { title: 'Divisions', getItemName: (i) => i.divisionName || i.name },
      sectors: { title: 'Sectors', getItemName: (i) => i.sectorName || i.name },
      projects: { title: 'Projects', getItemName: (i) => i.projectName || i.name },
      towers: { title: 'Towers', getItemName: (i) => i.towerName || i.name },
      units: { title: 'Units', getItemName: (i) => i.unitNumber || i.name },
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
      setCurrentPath((prev) => [...prev, { id: item._id, name: item.name }]);
      setCurrentLevel(nextLevel);
    }
  };

  const renderItemGrid = () => {
    const currentLevelData = getCurrentLevelData();
    const levelConfig = getLevelConfig();

    if (loading)
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Projects...</h3>
        </div>
      );

    if (error)
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

    return (
     <div className="flex flex-wrap gap-4 mt-6">
  {/* Plus Icon */}
  <div
    onClick={() => setIsModalOpen(true)}
    className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center"
  >
    <div className="w-24 h-20 flex items-center justify-center mb-2">
      <img src="/public/AddIcon.svg" alt="" className="w-22 h-22" />
    </div>
    <h3 className="text-xl text-center font-medium leading-tight min-h-12">
      Add New Project
    </h3>
  </div>



  {/* {currentLevel === 'units' ? (
    <div className="w-full mt-6 space-y-8">
      {Object.entries(
        currentLevelData.reduce((acc, unit) => {
          let floor = 'Unknown Floor';
          let unitLabel = unit.unitNumber;

          if (unit.unitNumber) {
           
            const parts = unit.unitNumber.split(',');
            const floorPart = parts[0]?.trim();
            const unitPart = parts[1]?.trim();

       
            const floorMatch = floorPart?.match(/floor\s*([0-9]+)/i);
            if (floorMatch && floorMatch[1]) {
              floor = `Floor ${floorMatch[1]}`;
            }

          
            const unitMatch = unitPart?.match(/unit\s*no\s*([a-z0-9]+)/i);
            if (unitMatch && unitMatch[1]) {
              unitLabel = `Unit No ${unitMatch[1]}`;
            } else if (unitPart) {
              unitLabel = unitPart;
            }
          }

      
          unit.cleanedUnitNumber = unitLabel;

          if (!acc[floor]) acc[floor] = [];
          acc[floor].push(unit);
          return acc;
        }, {})
      )
      
        .sort(
          ([a], [b]) =>
            parseInt(a.match(/\d+/)?.[0] || 0) -
            parseInt(b.match(/\d+/)?.[0] || 0)
        )
        .map(([floor, units]) => (
          <div key={floor} className="flex items-start gap-6">
        
            <div className="w-32 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-gray-800">{floor}</h2>
            </div>

            <div className="flex flex-wrap gap-4 flex-1">
              {units.map((unit) => (
                <div
                  key={unit._id}
                  onDoubleClick={() => {
                    setSelectedUnit(unit);
                    setIsUnitModalOpen(true);
                  }}
                  className="w-32 h-40 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center hover:bg-gray-50"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedUnit(unit);
                      setIsUnitModalOpen(true);
                    }
                  }}
                >
                  <div className="w-24 h-20 flex items-center justify-center mb-2">
                    <AnimatedFolder
                      tipColor={getStatusColor(unit.status).tipColor}
                      coverColor={getStatusColor(unit.status).coverColor}
                    />
                  </div>
                  <h3 className="font-medium text-center text-gray-900 text-xl leading-tight min-h-12">
                    {unit.cleanedUnitNumber}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  ) : (
    // Normal levels (unchanged)
    currentLevelData.map((item) => (
      <div
        key={item._id}
        onDoubleClick={() => handleNavigateToItem(item)}
        className="w-32 h-40 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center"
      >
        {currentLevel === 'cities' ? (
          <div className="w-24 h-20 flex items-center justify-center mb-2">
            <img
              src={getProjectIcon()}
              alt={`${filters.projectType} ${filters.constructionStatus} icon`}
              className="w-22 h-22"
            />
          </div>
        ) : (
          <div className="w-24 h-20 flex items-center justify-center mb-2">
            <AnimatedFolder />
          </div>
        )}
        <h3 className="font-medium text-center text-gray-900 text-xl leading-tight min-h-12">
          {levelConfig.getItemName(item)}
        </h3>
      </div>
    ))
  )} */}

  {/* Existing Items */}
{currentLevel === 'units' ? (
  <div className="w-full mt-6 space-y-8">
    {Object.entries(
      currentLevelData.reduce((acc, unit) => {
        let floor = 'Unknown Floor';
        let unitLabel = unit.unitNumber;

        if (unit.unitNumber) {
          // ✅ Split by comma
          const parts = unit.unitNumber.split(',');
          const floorPart = parts[0]?.trim();
          const unitPart = parts[1]?.trim();

          // ✅ Extract floor number (handles "floor 8" or "Floor 100")
          const floorMatch = floorPart?.match(/floor\s*([0-9]+)/i);
          if (floorMatch && floorMatch[1]) {
            floor = `Floor ${floorMatch[1]}`;
          }

          // ✅ Extract unit number (handles "Unit No 99" or just "99")
          const unitMatch = unitPart?.match(/unit\s*no\s*([a-z0-9]+)/i);
          if (unitMatch && unitMatch[1]) {
            unitLabel = `Unit No ${unitMatch[1]}`;
          } else if (unitPart) {
            unitLabel = unitPart;
          }
        }

        // ✅ Save cleaned-up label
        unit.cleanedUnitNumber = unitLabel;

        // ✅ Group by detected floor
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(unit);
        return acc;
      }, {})
    )
      // ✅ Sort floors numerically (descending: Floor 100 → Floor 1)
      .sort(([a], [b]) => {
        const floorA = parseInt(a.match(/\d+/)?.[0] || 0);
        const floorB = parseInt(b.match(/\d+/)?.[0] || 0);

        // ✅ Ensure "Unknown Floor" always appears last
        if (isNaN(floorA)) return 1;
        if (isNaN(floorB)) return -1;

        // ✅ Descending: higher floors first
        return floorB - floorA;
      })
      .map(([floor, units]) => (
        <div key={floor} className="flex items-start gap-6">
          {/* Floor Label */}
          <div className="w-32 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-gray-800">{floor}</h2>
          </div>

          {/* Units Row */}
          <div className="flex flex-wrap gap-4 flex-1">
            {units
              // ✅ Sort units ascending by unit number (1 → 2 → 10)
              .sort((a, b) => {
                const unitA = parseInt(a.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
                const unitB = parseInt(b.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
                return unitA - unitB;
              })
              .map((unit) => (
                <div
                  key={unit._id}
                  onDoubleClick={() => {
                    setSelectedUnit(unit);
                    setIsUnitModalOpen(true);
                  }}
                  className="w-32 h-40 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center hover:bg-gray-50"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedUnit(unit);
                      setIsUnitModalOpen(true);
                    }
                  }}
                >
                  <div className="w-24 h-20 flex items-center justify-center mb-2">
                    <AnimatedFolder
                      tipColor={getStatusColor(unit.status).tipColor}
                      coverColor={getStatusColor(unit.status).coverColor}
                    />
                  </div>
                  <h3 className="font-medium text-center text-gray-900 text-xl leading-tight min-h-12">
                    {unit.cleanedUnitNumber}
                  </h3>
                </div>
              ))}
          </div>
        </div>
      ))}
  </div>
) : (
  // Normal levels (unchanged)
  currentLevelData.map((item) => (
    <div
      key={item._id}
      onDoubleClick={() => handleNavigateToItem(item)}
      className="w-32 h-40 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center"
    >
      {currentLevel === 'cities' ? (
        <div className="w-24 h-20 flex items-center justify-center mb-2">
          <img
            src={getProjectIcon()}
            alt={`${filters.projectType} ${filters.constructionStatus} icon`}
            className="w-22 h-22"
          />
        </div>
      ) : (
        <div className="w-24 h-20 flex items-center justify-center mb-2">
          <AnimatedFolder />
        </div>
      )}
      <h3 className="font-medium text-center text-gray-900 text-xl leading-tight min-h-12">
        {levelConfig.getItemName(item)}
      </h3>
    </div>
  ))
)}




</div>

    );
  };

  return (
    <div>
      {currentLevel !== 'cities' && (
        <div className="flex items-center space-x-2 mb-4 rounded-lg">
          <button
            onClick={() => handleNavigateBack(-1)}
            className="flex items-center text-gray-700 hover:text-blue-800 transition-colors"
          >
            <Home className="h-4 w-4" />
          </button>
          {currentPath.map((p, i) => (
            <React.Fragment key={p.id}>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => handleNavigateBack(i)}
                className="text-gray-700 hover:text-blue-800 text-sm transition-colors"
              >
                {p.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {renderItemGrid()}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLevel={currentLevel}
        currentPath={getCurrentPath()}
        onSuccess={() => {
          refresh();
          setIsModalOpen(false);
          toast.success('Project created successfully!');
        }}
      />

      {/* Unit Info Modal */}
      <UnitInfoModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        unit={selectedUnit}
      />
    </div>
  );
};

export default ProjectsWorking;

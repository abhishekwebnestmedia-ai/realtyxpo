import React, { useState } from 'react';
import { Home, ChevronRight, Building2 } from 'lucide-react';
import { ToggleSwitch } from '../../components/ui';
import AnimatedFolder from '../../components/ui/AnimatedFolder';
import { ProjectModal } from '../../components/modals';
import { toast } from 'react-hot-toast';
import useProjects from '../../hooks/useProjects';

const ProjectsWorking = () => {
  // ✅ State Management
  const [filters, setFilters] = useState({
    projectType: 'Commercial',
    constructionStatus: 'ReadyToMove'
  });

  const [currentPath, setCurrentPath] = useState([]);
  const [currentLevel, setCurrentLevel] = useState('cities');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Fetch data via custom hook
  const { data: projectData, loading, error, refresh } = useProjects(filters);

  // ✅ Build context for modal
  const getCurrentPath = () => {
    const pathData = {
      category: filters.projectType,
      projectcategory: filters.constructionStatus
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

  // ✅ Handlers
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

  // ✅ Data traversal
  const getCurrentLevelData = () => {
    if (!projectData) return [];

    switch (currentLevel) {
      case 'cities':
        return projectData.cities || [];
      case 'divisions':
        return projectData.divisions?.[currentPath[0]?.id] || [];
      case 'sectors':
        return projectData.sectors?.[currentPath[1]?.id] || [];
      case 'projects':
        return projectData.projects?.[currentPath[2]?.id] || [];
      case 'towers':
        return projectData.towers?.[currentPath[3]?.id] || [];
      case 'units':
        return projectData.units?.[currentPath[4]?.id] || [];
      default:
        return [];
    }
  };

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

  const getLevelConfig = () => {
    const configs = {
      cities: { title: 'Cities', getItemName: (i) => i.cityName || i.name },
      divisions: { title: 'Divisions', getItemName: (i) => i.divisionName || i.name },
      sectors: { title: 'Sectors', getItemName: (i) => i.sectorName || i.name },
      projects: { title: 'Projects', getItemName: (i) => i.projectName || i.name },
      towers: { title: 'Towers', getItemName: (i) => i.towerName || i.name },
      units: { title: 'Units', getItemName: (i) => i.unitNumber || i.name }
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

  // ✅ Render Filters
  const renderFilterSection = () => (
    <div>
      <h1 className="pageheading mb-4">Projects Working</h1>
      {currentLevel === 'cities' && (
        <div className="flex flex-wrap gap-6 mb-4">
          <ToggleSwitch
            value={filters.projectType}
            options={[
              { value: 'Commercial', label: 'Commercial' },
              { value: 'Residential', label: 'Residential' }
            ]}
            onChange={handleProjectTypeChange}
            size="md"
          />
          <ToggleSwitch
            value={filters.constructionStatus}
            options={[
              { value: 'ReadyToMove', label: 'Ready To Move' },
              { value: 'UnderConstruction', label: 'Under Construction' }
            ]}
            onChange={handleConstructionStatusChange}
            size="md"
          />
        </div>
      )}
    </div>
  );

  // ✅ Render Breadcrumbs
  const renderBreadcrumbs = () => (
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
  );

  // ✅ MAIN GRID RENDER
  const renderItemGrid = () => {
    const currentLevelData = getCurrentLevelData();
    const levelConfig = getLevelConfig();

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Projects...</h3>
        </div>
      );
    }

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

    // ✅ Special handling for UNITS level (floor + unit grouping)
    if (currentLevel === 'units') {
      const groupedByFloor = currentLevelData.reduce((acc, unit) => {
        let floor = 'Unknown Floor';
        let unitLabel = unit.unitNumber;

        if (unit.unitNumber) {
          const parts = unit.unitNumber.split(',');
          const floorPart = parts[0]?.trim();
          const unitPart = parts[1]?.trim();

          const floorMatch = floorPart?.match(/floor\s*([0-9]+)/i);
          if (floorMatch && floorMatch[1]) floor = `Floor ${floorMatch[1]}`;

          const unitMatch = unitPart?.match(/unit\s*no\s*([a-z0-9]+)/i);
          if (unitMatch && unitMatch[1]) unitLabel = `Unit No ${unitMatch[1]}`;
          else if (unitPart) unitLabel = unitPart;
        }

        unit.cleanedUnitNumber = unitLabel;
        if (!acc[floor]) acc[floor] = [];
        acc[floor].push(unit);
        return acc;
      }, {});

      const sortedFloors = Object.entries(groupedByFloor).sort(([a], [b]) => {
        const floorA = parseInt(a.match(/\d+/)?.[0] || 0);
        const floorB = parseInt(b.match(/\d+/)?.[0] || 0);
        if (isNaN(floorA)) return 1;
        if (isNaN(floorB)) return -1;
        return floorB - floorA;
      });

      return (
        <div className="w-full mt-6 space-y-8">
          {/* Add Unit Button */}
          <div
            onClick={() => setIsModalOpen(true)}
            className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <div className="w-24 h-20 flex items-center justify-center mb-2">
              <img src="/public/AddIcon.svg" alt="" className="w-22 h-22" />
            </div>
            <h3 className="text-xl text-center font-medium leading-tight min-h-12">
              Add New Unit
            </h3>
          </div>

          {/* Floors & Units */}
 
           {/* {sortedFloors.map(([floor, units]) => (
              <div className='flex items-center justify-center'>

  <div key={floor} className="flex items-start gap-6">
              <div className="w-32 flex-shrink-0">
                <h2 className="text-2xl font-semibold text-gray-800">{floor}</h2>
              </div>

              <div className="flex flex-wrap gap-4 flex-1">
                {units
                  .sort((a, b) => {
                    const unitA = parseInt(a.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
                    const unitB = parseInt(b.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
                    return unitA - unitB;
                  })
                  .map((unit) => (
                    <div
                      key={unit._id}
                      onDoubleClick={() => handleNavigateToItem(unit)}
                      className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
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

            
            </div>

          
          ))} */}

{/* <div className="flex flex-col items-center justify-center w-full space-y-10">
  {sortedFloors.map(([floor, units]) => (
    <div
      key={floor}
      className="flex items-center gap-10 justify-center "
    >
     
      <div className=" max-w-10 text-right w-full  gap-5 ">
        <h2 className="text-2xl font-semibold text-gray-800">{floor}</h2>
      </div>

   
      <div className="flex flex-wrap gap-4 flex-1 justify-center">
        {units
          .sort((a, b) => {
            const unitA = parseInt(a.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
            const unitB = parseInt(b.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
            return unitA - unitB;
          })
          .map((unit) => (
            <div
              key={unit._id}
              onDoubleClick={() => handleNavigateToItem(unit)}
              className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
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
</div> */}


<div className="grid justify-center w-full gap-10">
  {sortedFloors.map(([floor, units]) => (
    <div
      key={floor}
      className="grid grid-cols-[150px_minmax(400px,_1fr)] items-center justify-center gap-10 max-w-6xl mx-auto"
    >
      {/* Floor Label Column */}
      <div className="text-right">
        <h2 className="text-2xl font-semibold text-gray-800">
        {floor}
        </h2>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(128px,_1fr))] gap-4 justify-start">
        {units
          .sort((a, b) => {
            const unitA = parseInt(a.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
            const unitB = parseInt(b.cleanedUnitNumber.match(/\d+/)?.[0] || 0);
            return unitA - unitB;
          })
          .map((unit) => (
            <div
              key={unit._id}
              onDoubleClick={() => handleNavigateToItem(unit)}
              className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
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

          
       </div>
      
      );
    }

    // ✅ Default grid for other levels
    return (
      <div className="flex flex-wrap gap-4 mt-6">
        {/* Add Button */}
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

        {/* Items */}
        {currentLevelData.map((item) => (
          <div
            key={item._id}
            onDoubleClick={() => handleNavigateToItem(item)}
            className="w-32 h-40 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
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
        ))}
      </div>
    );
  };

  // ✅ Final Render
  return (
    <div>
      {renderFilterSection()}
      {currentLevel !== 'cities' && renderBreadcrumbs()}

      <div className="flex flex-row">{renderItemGrid()}</div>

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
    </div>
  );
};

export default ProjectsWorking;

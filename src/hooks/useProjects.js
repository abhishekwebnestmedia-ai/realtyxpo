import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const useProjects = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Process projects into hierarchical structure
  const processProjectHierarchy = useCallback((projects) => {
    const hierarchy = {
      cities: [],
      divisions: {},
      sectors: {},
      projects: {},
      towers: {},
      units: {}
    };

    // Keep track of added items to avoid duplicates
    const addedCities = new Set();
    const addedDivisions = new Set();
    const addedSectors = new Set();
    const addedProjects = new Set();
    const addedTowers = new Set();

    // Process each project
    projects.forEach(project => {
      if (project.cities && Array.isArray(project.cities)) {
        project.cities.forEach(city => {
          const cityKey = city.cityName;
          const cityId = city._id || cityKey;

          // Add city if not exists
          if (!addedCities.has(cityKey)) {
            hierarchy.cities.push({
              _id: cityId,
              name: city.cityName,
              cityName: city.cityName
            });
            addedCities.add(cityKey);
          }

          // Process divisions
          if (city.divisions && Array.isArray(city.divisions)) {
            if (!hierarchy.divisions[cityId]) {
              hierarchy.divisions[cityId] = [];
            }

            city.divisions.forEach(division => {
              const divisionKey = `${cityKey}-${division.divisionName}`;
              const divisionId = division._id || divisionKey;

              if (!addedDivisions.has(divisionKey)) {
                hierarchy.divisions[cityId].push({
                  _id: divisionId,
                  name: division.divisionName,
                  divisionName: division.divisionName
                });
                addedDivisions.add(divisionKey);
              }

              // Process sectors
              if (division.sectors && Array.isArray(division.sectors)) {
                if (!hierarchy.sectors[divisionId]) {
                  hierarchy.sectors[divisionId] = [];
                }

                division.sectors.forEach(sector => {
                  const sectorKey = `${divisionKey}-${sector.sectorName}`;
                  const sectorId = sector._id || sectorKey;

                  if (!addedSectors.has(sectorKey)) {
                    hierarchy.sectors[divisionId].push({
                      _id: sectorId,
                      name: sector.sectorName,
                      sectorName: sector.sectorName
                    });
                    addedSectors.add(sectorKey);
                  }

                  // Process projects
                  if (sector.projects && Array.isArray(sector.projects)) {
                    if (!hierarchy.projects[sectorId]) {
                      hierarchy.projects[sectorId] = [];
                    }

                    sector.projects.forEach(proj => {
                      const projectKey = `${sectorKey}-${proj.projectName}`;
                      const projectId = proj._id || projectKey;

                      if (!addedProjects.has(projectKey)) {
                        hierarchy.projects[sectorId].push({
                          _id: projectId,
                          name: proj.projectName,
                          projectName: proj.projectName
                        });
                        addedProjects.add(projectKey);
                      }

                      // Process towers
                      if (proj.towers && Array.isArray(proj.towers)) {
                        if (!hierarchy.towers[projectId]) {
                          hierarchy.towers[projectId] = [];
                        }

                        proj.towers.forEach(tower => {
                          const towerKey = `${projectKey}-${tower.towerName}`;
                          const towerId = tower._id || towerKey;

                          if (!addedTowers.has(towerKey)) {
                            hierarchy.towers[projectId].push({
                              _id: towerId,
                              name: tower.towerName,
                              towerName: tower.towerName
                            });
                            addedTowers.add(towerKey);
                          }

                          // Process units
                          if (tower.units && Array.isArray(tower.units)) {
                            if (!hierarchy.units[towerId]) {
                              hierarchy.units[towerId] = [];
                            }

                            tower.units.forEach(unit => {
                              hierarchy.units[towerId].push({
                                _id: unit._id || `${towerId}-${unit.unitNumber}`,
                                unitNumber: unit.unitNumber,
                                ownerName: unit.ownerName || '',
                                status: unit.status?.toLowerCase() || 'vacant',
                                email: unit.email || '',
                                mobileNumbers: unit.mobileNumbers || [],
                                remarks: unit.remarks || '',
                                followUpDate: unit.followUpDate || null
                              });
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return hierarchy;
  }, []);

  // Fetch projects data
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try multiple possible endpoints
      let response;
      
      try {
        // First try: project-types endpoint (most likely)
        response = await api.get('/projects/project-types');
        console.log("repsonse pro",response.data);
      } catch {
        try {
          // Second try: inventory endpoint (might contain project info)
          response = await api.get('/inventry/inventrylist');
        } catch {
          try {
            // Third try: project-types/full endpoint
            response = await api.get('/projects/project-types/full');
          } catch {
            throw new Error('No available project endpoints found');
          }
        }
      }
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      // Handle different response structures
      let projectsArray = [];
      
      if (Array.isArray(response.data)) {
        projectsArray = response.data;
      } else if (response.data.projects && Array.isArray(response.data.projects)) {
        projectsArray = response.data.projects;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        projectsArray = response.data.data;
      } else if (response.data.projectTypes && Array.isArray(response.data.projectTypes)) {
        projectsArray = response.data.projectTypes;
      } else if (response.data.inventory && Array.isArray(response.data.inventory)) {
        // Handle inventory data structure
        projectsArray = response.data.inventory;
      } else {
        projectsArray = [];
      }

      let projects = projectsArray;
      
      // Client-side filtering
      if (filters.projectType || filters.constructionStatus) {
        projects = projects.filter(project => {
          const categoryMatch = !filters.projectType || project.category === filters.projectType;
          const statusMatch = !filters.constructionStatus || project.projectcategory === filters.constructionStatus;
          return categoryMatch && statusMatch;
        });
      }

      // Process into hierarchy
      const processedData = processProjectHierarchy(projects);

      setData(processedData);
    } catch (err) {
      console.error('useProjects: API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, processProjectHierarchy]);

  // Fetch data when filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Refresh function for manual refetch
  const refresh = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    data,
    loading,
    error,
    refresh
  };
};

export default useProjects;
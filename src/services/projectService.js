// Project service for API calls
import api from '../api/api';

class ProjectService {
  // Fetch project types
  async getProjectTypes() {
    try {
      const response = await api.get('/projects/project-types');
      const data = response.data;
      
      // Handle different possible response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data.projectTypes && Array.isArray(data.projectTypes)) {
        return data.projectTypes;
      } else if (data.success && data.result) {
        return Array.isArray(data.result) ? data.result : [];
      } else {
        console.warn('Unexpected API response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching project types:', error);
      throw error;
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update existing project
  async updateProject(projectId, projectData) {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Fetch all projects with filtering
  async getProjects(filters = {}) {
    try {
      const response = await api.get('/projects');
      const data = response.data;
      
      // Filter projects based on the provided filters
      let filteredProjects = data;
      if (filters.projectType || filters.constructionStatus) {
        filteredProjects = data.filter(project => {
          const categoryMatch = !filters.projectType || project.category === filters.projectType;
          const statusMatch = !filters.constructionStatus || project.projectcategory === filters.constructionStatus;
          return categoryMatch && statusMatch;
        });
      }
      
      const normalizedData = this.normalizeProjectData(filteredProjects);
      return normalizedData;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Normalize API response to expected format
  normalizeProjectData(apiData) {
    const projects = Array.isArray(apiData) ? apiData : [];
    return this.processProjectHierarchy(projects);
  }

  // Process projects into hierarchical structure
  processProjectHierarchy(projects) {
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
  }

  // Deletion endpoints
  async deleteCity(id) {
    if (!id) throw new Error('City id is required');
    const res = await api.delete(`/projects/city/${id}`);
    return res.data;
  }

  async deleteDivision(id) {
    if (!id) throw new Error('Division id is required');
    const res = await api.delete(`/projects/division/${id}`);
    return res.data;
  }

  async deleteSector(id) {
    if (!id) throw new Error('Sector id is required');
    const res = await api.delete(`/projects/sector/${id}`);
    return res.data;
  }

  async deleteProjectById(id) {
    if (!id) throw new Error('Project id is required');
    const res = await api.delete(`/projects/project/${id}`);
    return res.data;
  }

  async deleteTower(id) {
    if (!id) throw new Error('Tower id is required');
    const res = await api.delete(`/projects/tower/${id}`);
    return res.data;
  }

  async deleteUnit(id) {
    if (!id) throw new Error('Unit id is required');
    const res = await api.delete(`/projects/unit/${id}`);
    return res.data;
  }
}

export default new ProjectService();
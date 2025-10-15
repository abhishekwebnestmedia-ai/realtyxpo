import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';
import { PROJECT_TYPE_OPTIONS, CONSTRUCTION_STATUS_OPTIONS } from '../../constants/projectsWorking';

const ProjectModal = ({ 
  isOpen, 
  onClose, 
  currentLevel, 
  currentPath = {},
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    category: 'Residential',
    projectcategory: 'UnderConstruction',
    cityName: '',
    divisionName: '',
    sectorName: '',
    projectName: '',
    towerName: '',
    unitNumber: '',
    ownerName: '',
    mobileNumbers: [''],
    email: '',
    status: 'Vacant',
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});

  // Update form data when currentPath changes (when modal opens at different levels)
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        category: currentPath.category || prev.category,
        projectcategory: currentPath.projectcategory || prev.projectcategory,
        cityName: currentPath.cityName || '',
        divisionName: currentPath.divisionName || '',
        sectorName: currentPath.sectorName || '',
        projectName: currentPath.projectName || '',
        towerName: currentPath.towerName || ''
      }));
      // Reset to step 1 when modal opens
      setCurrentStep(1);
      setFormErrors({});
    }
  }, [isOpen, currentPath]);

  // Flexible hierarchy validation - only check logical dependencies
  const validateHierarchy = () => {
    const errors = {};
    
    // Logical dependency rules:
    // 1. If tower is filled, project name is required
    // 2. If unit is filled, tower is required (and thus project too)
    // 3. Users can fill up to any level (city, division, sector, project, tower, unit)
    
    if (formData.towerName.trim() && !formData.projectName.trim()) {
      errors.projectName = 'Project name is required when adding towers';
    }
    
    // Additional logical dependencies can be added here
    // For example: if (formData.divisionName.trim() && !formData.cityName.trim()) { ... }

    return errors;
  };

  // Step 2: Unit details validation - only if user is creating units
  const validateUnitDetails = () => {
    const errors = {};
    
    // Only validate if user has started filling unit details
    const hasUnitData = formData.unitNumber.trim() || formData.ownerName.trim() || 
                       formData.mobileNumbers.some(num => num.trim());
    
    if (!hasUnitData) {
      return errors; // No validation needed if no unit data
    }
    
    // If user is creating units, these fields are required
    if (!formData.unitNumber.trim()) {
      errors.unitNumber = 'Unit number is required when creating units';
    }
    
    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Owner name is required when creating units';
    }
    
    const validMobiles = formData.mobileNumbers.filter(num => num.trim());
    if (validMobiles.length === 0) {
      errors.mobileNumbers = 'At least one mobile number is required when creating units';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    return errors;
  };

  // Handle step navigation - no validation, allow free movement
  const handleNextStep = () => {
    setFormErrors({});
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setFormErrors({});
  };

  // Render Step 1: Project Details
  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Project Type and Construction Status - Single Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Project Type - Radio Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Project Type <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            {PROJECT_TYPE_OPTIONS.map((type, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value={type.value}
                  checked={formData.category === type.value}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  disabled={getFieldReadonly('category')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Construction Status - Radio Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Construction Status <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            {CONSTRUCTION_STATUS_OPTIONS.map((status, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="projectcategory"
                  value={status.value}
                  checked={formData.projectcategory === status.value}
                  onChange={(e) => handleInputChange('projectcategory', e.target.value)}
                  disabled={getFieldReadonly('projectcategory')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">{status.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Form Fields in 2-column Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* City Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City Name
          </label>
          <input
            type="text"
            value={formData.cityName}
            onChange={(e) => handleInputChange('cityName', e.target.value)}
            disabled={getFieldReadonly('cityName')}
            placeholder="Enter city name"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              formErrors.cityName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.cityName && <p className="text-red-500 text-xs mt-1">{formErrors.cityName}</p>}
        </div>

        {/* Division Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Division Name
          </label>
          <input
            type="text"
            value={formData.divisionName}
            onChange={(e) => handleInputChange('divisionName', e.target.value)}
            disabled={getFieldReadonly('divisionName')}
            placeholder="Enter division name"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              formErrors.divisionName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.divisionName && <p className="text-red-500 text-xs mt-1">{formErrors.divisionName}</p>}
        </div>

        {/* Sector Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sector Name
          </label>
          <input
            type="text"
            value={formData.sectorName}
            onChange={(e) => handleInputChange('sectorName', e.target.value)}
            disabled={getFieldReadonly('sectorName')}
            placeholder="Enter sector name"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              formErrors.sectorName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.sectorName && <p className="text-red-500 text-xs mt-1">{formErrors.sectorName}</p>}
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name {formData.towerName.trim() && <span className="text-red-500">*</span>}
            {formData.towerName.trim() && <span className="text-xs text-gray-500"> (required for towers)</span>}
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => handleInputChange('projectName', e.target.value)}
            disabled={getFieldReadonly('projectName')}
            placeholder="Enter project name"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              formErrors.projectName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.projectName && <p className="text-red-500 text-xs mt-1">{formErrors.projectName}</p>}
        </div>

        {/* Tower Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tower Name
          </label>
          <input
            type="text"
            value={formData.towerName}
            onChange={(e) => handleInputChange('towerName', e.target.value)}
            disabled={getFieldReadonly('towerName')}
            placeholder="Enter tower name"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              formErrors.towerName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.towerName && <p className="text-red-500 text-xs mt-1">{formErrors.towerName}</p>}
        </div>

        {/* Unit Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number
          </label>
          <input
            type="text"
            value={formData.unitNumber}
            onChange={(e) => handleInputChange('unitNumber', e.target.value)}
            placeholder="Enter unit number (e.g., 101, 102)"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.unitNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.unitNumber && <p className="text-red-500 text-xs mt-1">{formErrors.unitNumber}</p>}
        </div>
      </div>
    </div>
  );

  // Render Step 2: Unit Details
  const renderStep2 = () => {
    // Check if user has started filling unit details
    const hasUnitData = formData.unitNumber.trim() || formData.ownerName.trim() || 
                       formData.mobileNumbers.some(num => num.trim());
    
    return (
    <div className="space-y-4 scrollbar-hidden">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Optional:</strong> Fill unit details only if you want to create specific units. 
          You can also just create the project structure without units.
        </p>
      </div>
      
      {/* Form Fields in 2-column Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Owner Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner Name {hasUnitData && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => handleInputChange('ownerName', e.target.value)}
            placeholder="Enter owner name"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.ownerName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.ownerName && <p className="text-red-500 text-xs mt-1">{formErrors.ownerName}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>
      </div>

      {/* Mobile Numbers - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Numbers {hasUnitData && <span className="text-red-500">*</span>}
        </label>
        {formData.mobileNumbers.map((mobile, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="tel"
              value={mobile}
              onChange={(e) => handleMobileChange(index, e.target.value)}
              placeholder="Enter mobile number"
              className={`flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.mobileNumbers ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formData.mobileNumbers.length > 1 && (
              <button
                type="button"
                onClick={() => removeMobileField(index)}
                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addMobileField}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
        >
          <Plus size={16} />
          Add Mobile Number
        </button>
        {formErrors.mobileNumbers && <p className="text-red-500 text-xs mt-1">{formErrors.mobileNumbers}</p>}
      </div>

      {/* Status - Radio Buttons */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="grid grid-cols-2 gap-4">
          {['Vacant', 'Rental', 'Self Occupied', 'Interested in Selling'].map((status) => (
            <label key={status} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={status}
                checked={formData.status === status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Remarks - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          value={formData.remarks}
          onChange={(e) => handleInputChange('remarks', e.target.value)}
          placeholder="Enter any additional remarks"
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    );
  };

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMobileChange = (index, value) => {
    const newMobiles = [...formData.mobileNumbers];
    newMobiles[index] = value;
    setFormData(prev => ({
      ...prev,
      mobileNumbers: newMobiles
    }));
  };

  const addMobileField = () => {
    setFormData(prev => ({
      ...prev,
      mobileNumbers: [...prev.mobileNumbers, '']
    }));
  };

  const removeMobileField = (index) => {
    if (formData.mobileNumbers.length > 1) {
      const newMobiles = formData.mobileNumbers.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        mobileNumbers: newMobiles
      }));
    }
  };

  const buildProjectStructure = () => {
    const structure = {
      category: formData.category,
      projectcategory: formData.projectcategory,
    };

    // Only add cities if cityName exists
    if (formData.cityName.trim()) {
      structure.cities = [{
        cityName: formData.cityName,
        divisions: []
      }];

      // Only add divisions if divisionName exists
      if (formData.divisionName.trim()) {
        structure.cities[0].divisions = [{
          divisionName: formData.divisionName,
          sectors: []
        }];

        // Only add sectors if sectorName exists
        if (formData.sectorName.trim()) {
          structure.cities[0].divisions[0].sectors = [{
            sectorName: formData.sectorName,
            projects: []
          }];

          // Only add projects if projectName exists
          if (formData.projectName.trim()) {
            structure.cities[0].divisions[0].sectors[0].projects = [{
              projectName: formData.projectName,
              towers: []
            }];

            // Only add towers if towerName exists
            if (formData.towerName.trim()) {
              structure.cities[0].divisions[0].sectors[0].projects[0].towers = [{
                towerName: formData.towerName,
                units: []
              }];

              // Only add units if unitNumber exists
              if (formData.unitNumber.trim()) {
                structure.cities[0].divisions[0].sectors[0].projects[0].towers[0].units = [{
                  unitNumber: formData.unitNumber,
                  ownerName: formData.ownerName,
                  mobileNumbers: formData.mobileNumbers.filter(num => num.trim()),
                  email: formData.email,
                  status: formData.status,
                  remarks: formData.remarks
                }];
              }
            }
          }
        }
      }
    }

    return structure;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If on step 1, just move to next step without validation
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    // Step 2: Final submission with flexible validation
    setIsSubmitting(true);

    try {
      // Basic validation - ensure required fields are filled
      if (!formData.category || !formData.projectcategory) {
        toast.error('Project Type and Construction Status are required');
        setIsSubmitting(false);
        return;
      }
      
      // Only validate logical dependencies and unit details if filled
      const hierarchyErrors = validateHierarchy();
      let unitErrors = {};
      
      // Debug: Log validation results
      console.log('Hierarchy errors:', hierarchyErrors);
      console.log('Form data being validated:', formData);
      
      // Only validate unit details if user is trying to create units
      if (formData.unitNumber.trim() || formData.ownerName.trim() || 
          formData.mobileNumbers.some(num => num.trim())) {
        unitErrors = validateUnitDetails();
        
        // If unit is being filled, tower is required
        if (!formData.towerName.trim()) {
          hierarchyErrors.towerName = 'Tower name is required when adding units';
        }
      }
      
      const allErrors = { ...hierarchyErrors, ...unitErrors };
      
      if (Object.keys(allErrors).length > 0) {
        setFormErrors(allErrors);
        toast.error('Please fix the validation errors before submitting');
        setIsSubmitting(false);
        return;
      }

      const projectData = buildProjectStructure();
      
      // Debug: Log the data being sent
      console.log('Submitting project data:', JSON.stringify(projectData, null, 2));
      
      // Create new project
      // await api.post('/projects/project-types/full', projectData);
      await api.post('/projects/project-types/merge', projectData);

      toast.success('Project created successfully!');

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error submitting project:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to submit project. Please try again.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldReadonly = (field) => {
    switch (currentLevel) {
      case 'cities':
        return false;
      case 'divisions':
        return ['category', 'projectcategory', 'cityName'].includes(field);
      case 'sectors':
        return ['category', 'projectcategory', 'cityName', 'divisionName'].includes(field);
      case 'projects':
        return ['category', 'projectcategory', 'cityName', 'divisionName', 'sectorName'].includes(field);
      case 'towers':
        return ['category', 'projectcategory', 'cityName', 'divisionName', 'sectorName', 'projectName'].includes(field);
      case 'units':
        return ['category', 'projectcategory', 'cityName', 'divisionName', 'sectorName', 'projectName', 'towerName'].includes(field);
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              {currentLevel === 'units' ? 'View Unit' : 'New Project'}
            </h2>
            {/* Stepper Indicator */}
            <div className="flex items-center mt-2 space-x-4">
              <div className={`flex items-center ${currentStep === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {currentStep === 1 ? '1' : '✓'}
                </div>
                <span className="ml-2 text-sm font-medium">Project Details</span>
              </div>
              <div className={`w-8 h-0.5 ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${currentStep === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Unit Details</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 ? renderStep1() : renderStep2()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <div>
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : currentStep === 1 ? 'Next' : 'Create Project'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;




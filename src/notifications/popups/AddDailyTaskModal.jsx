import React, { useState } from "react";
import { X, Save, Plus } from "lucide-react";
import { useCreateDailyTask, useUpdateDailyTask } from "../../hooks/useDailyTasks";

const AddDailyTaskModal = ({ isOpen, onClose, taskData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: taskData?.name || "",
    date: taskData?.date || new Date().toISOString().split('T')[0],
    morningCommitment: {
      onlinePortalChecked: taskData?.morningCommitment?.onlinePortalChecked || 0,
      whatsappStatus: taskData?.morningCommitment?.whatsappStatus || 0,
      emailWorking: taskData?.morningCommitment?.emailWorking || 0,
      buyersWorking: taskData?.morningCommitment?.buyersWorking || 0,
      sellersWorking: taskData?.morningCommitment?.sellersWorking || 0
    },
    eveningAchievements: {
      onlinePortalChecked: taskData?.eveningAchievements?.onlinePortalChecked || 0,
      whatsappStatus: taskData?.eveningAchievements?.whatsappStatus || 0,
      emailWorking: taskData?.eveningAchievements?.emailWorking || 0,
      buyersWorking: taskData?.eveningAchievements?.buyersWorking || 0,
      sellersWorking: taskData?.eveningAchievements?.sellersWorking || 0
    },
    meetingVisits: taskData?.meetingVisits || 0,
    addNotes: taskData?.addNotes || ""
  });

  const [errors, setErrors] = useState({});
  const createTaskMutation = useCreateDailyTask();
  const updateTaskMutation = useUpdateDailyTask();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEdit && taskData?.id) {
        await updateTaskMutation.mutateAsync({
          id: taskData.id,
          taskData: formData
        });
      } else {
        await createTaskMutation.mutateAsync(formData);
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to save daily task:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      date: new Date().toISOString().split('T')[0],
      morningCommitment: {
        onlinePortalChecked: 0,
        whatsappStatus: 0,
        emailWorking: 0,
        buyersWorking: 0,
        sellersWorking: 0
      },
      eveningAchievements: {
        onlinePortalChecked: 0,
        whatsappStatus: 0,
        emailWorking: 0,
        buyersWorking: 0,
        sellersWorking: 0
      },
      meetingVisits: 0,
      addNotes: ""
    });
    setErrors({});
    onClose();
  };

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? "Update Daily Task" : "Add Daily Task"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange(null, 'name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange(null, 'date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>
          </div>

          {/* Morning Commitment */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Morning Commitment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Portal Checked
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.morningCommitment.onlinePortalChecked}
                  onChange={(e) => handleInputChange('morningCommitment', 'onlinePortalChecked', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Status
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.morningCommitment.whatsappStatus}
                  onChange={(e) => handleInputChange('morningCommitment', 'whatsappStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Working
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.morningCommitment.emailWorking}
                  onChange={(e) => handleInputChange('morningCommitment', 'emailWorking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyers Working
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.morningCommitment.buyersWorking}
                  onChange={(e) => handleInputChange('morningCommitment', 'buyersWorking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sellers Working
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.morningCommitment.sellersWorking}
                  onChange={(e) => handleInputChange('morningCommitment', 'sellersWorking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Evening Achievements */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Evening Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Portal Checked
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.eveningAchievements.onlinePortalChecked}
                  onChange={(e) => handleInputChange('eveningAchievements', 'onlinePortalChecked', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Status
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.eveningAchievements.whatsappStatus}
                  onChange={(e) => handleInputChange('eveningAchievements', 'whatsappStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Working
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.eveningAchievements.emailWorking}
                  onChange={(e) => handleInputChange('eveningAchievements', 'emailWorking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyers Working
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.eveningAchievements.buyersWorking}
                  onChange={(e) => handleInputChange('eveningAchievements', 'buyersWorking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sellers Working
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.eveningAchievements.sellersWorking}
                  onChange={(e) => handleInputChange('eveningAchievements', 'sellersWorking', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Meeting Visits and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Visits
              </label>
              <input
                type="number"
                min="0"
                value={formData.meetingVisits}
                onChange={(e) => handleInputChange(null, 'meetingVisits', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.addNotes}
                onChange={(e) => handleInputChange(null, 'addNotes', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEdit ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isEdit ? "Update Task" : "Create Task"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDailyTaskModal;
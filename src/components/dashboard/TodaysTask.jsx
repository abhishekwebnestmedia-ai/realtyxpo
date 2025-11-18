import React, { useState, useMemo, useContext, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { CheckSquare, Filter, Download, ExternalLink, PlusCircle, Search, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDailyTasks, useUpdateDailyTask, useCreateDailyTask, useTodaysDailyTask } from "../../hooks/useDailyTasks";
import { AuthContext } from "../../context/AuthContext";

const TodaysTask = ({ isDashboard = false, userRole = 'user' }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Use the new efficient API for today's task detection
  const userName = user?.name || user?.firstName || user?.username || 'User';
  const { data: todaysTask, isLoading: todayLoading } = useTodaysDailyTask(userName);
  
  // Keep the existing API for admin table view
  const { data: dailyTasksData = [], isLoading, isError } = useDailyTasks();
  
  const updateDailyTask = useUpdateDailyTask();
  const createDailyTask = useCreateDailyTask();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [rowsPerPage, setRowsPerPage] = useState(isDashboard ? 999 : 4); // Show all on dashboard
  
  // Notes popup state
  const [isNotesPopupOpen, setIsNotesPopupOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");

  // Time-based workflow state - now derived from API data
  // Get current submission status based on today's task data (using efficient API)
  const submissionStatus = useMemo(() => {
    if (todayLoading) {
      return 'none'; // Default while loading
    }

    if (!todaysTask) {
      return 'none'; // No task for today
    }

    // Helper: consider a value 'meaningful' only when it's explicitly set to a non-default value
    const isMeaningful = (val) => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'boolean') return val === true; // only true counts
      if (typeof val === 'number') return Number(val) > 0; // counts > 0
      if (typeof val === 'string') return val.trim() !== '' && val.trim() !== '0';
      return Boolean(val);
    };

    // Check if morning commitment has meaningful data (treat defaults as not filled)
    const m = todaysTask.morningCommitment || {};
    const hasMorning = Object.keys(m).length > 0 && (
      isMeaningful(m.onlinePortalChecked) ||
      isMeaningful(m.whatsappStatus) ||
      isMeaningful(m.emailWorking) ||
      isMeaningful(m.buyersWorking) ||
      isMeaningful(m.sellersWorking) ||
      isMeaningful(m.meetingVisits)
    );

    // Check if evening achievements has meaningful data  
    const hasEvening = todaysTask.eveningAchievements && 
      Object.keys(todaysTask.eveningAchievements).length > 0 &&
      // Check if it has more than just default false values
      (todaysTask.eveningAchievements.emailWorking > 0 ||
       todaysTask.eveningAchievements.buyersWorking ||
       todaysTask.eveningAchievements.sellersWorking ||
       // Only count as complete if portal/whatsapp are true (not just false)
       (todaysTask.eveningAchievements.onlinePortalChecked === true ||
        todaysTask.eveningAchievements.whatsappStatus === true));

    if (hasMorning && hasEvening) {
      return 'both';
    } else if (hasMorning) {
      return 'morning';
    } else {
      return 'none';
    }
  }, [todaysTask, todayLoading]);

  // Determine current workflow state
  const workflowState = useMemo(() => {
    switch (submissionStatus) {
      case 'none':
        return {
          morningEnabled: true,
          eveningEnabled: false,
          showSubmissionStatus: false
        };
      case 'morning':
        return {
          morningEnabled: false,
          eveningEnabled: true,
          showSubmissionStatus: true
        };
      case 'both':
        return {
          morningEnabled: false,
          eveningEnabled: false,
          showSubmissionStatus: true
        };
      default:
        return {
          morningEnabled: true,
          eveningEnabled: false,
          showSubmissionStatus: false
        };
    }
  }, [submissionStatus]);

  // User form state for simplified view
  const [formData, setFormData] = useState({
    morning: {
      onlinePortal: null, // Changed from false to null to track user selection
      whatsappStatus: null, // Changed from false to null to track user selection
      emailWorking: '',
      buyersWorking: '',
      sellersWorking: '',
      meetingVisits: '',
      addNote: ''
    },
    evening: {
      onlinePortal: null, // Changed from false to null to track user selection
      whatsappStatus: null, // Changed from false to null to track user selection
      emailWorking: '',
      buyersWorking: '',
      sellersWorking: '',
      meetingVisits: '',
      addNote: ''
    }
  });

  // Prefill formData when today's task is loaded so submitted morning values are visible
  useEffect(() => {
    if (!todaysTask) return;

    setFormData(prev => ({
      morning: {
        onlinePortal: todaysTask?.morningCommitment?.onlinePortalChecked === true ? true : (todaysTask?.morningCommitment?.onlinePortalChecked === false ? false : prev.morning.onlinePortal),
        whatsappStatus: todaysTask?.morningCommitment?.whatsappStatus === true ? true : (todaysTask?.morningCommitment?.whatsappStatus === false ? false : prev.morning.whatsappStatus),
        emailWorking: todaysTask?.morningCommitment?.emailWorking != null ? String(todaysTask.morningCommitment.emailWorking) : prev.morning.emailWorking,
        buyersWorking: todaysTask?.morningCommitment?.buyersWorking != null ? String(todaysTask.morningCommitment.buyersWorking) : prev.morning.buyersWorking,
        sellersWorking: todaysTask?.morningCommitment?.sellersWorking != null ? String(todaysTask.morningCommitment.sellersWorking) : prev.morning.sellersWorking,
        meetingVisits: todaysTask?.meetingVisits != null ? String(todaysTask.meetingVisits) : prev.morning.meetingVisits,
        addNote: todaysTask?.addNotes || prev.morning.addNote
      },
      evening: {
        onlinePortal: todaysTask?.eveningAchievements?.onlinePortalChecked === true ? true : (todaysTask?.eveningAchievements?.onlinePortalChecked === false ? false : prev.evening.onlinePortal),
        whatsappStatus: todaysTask?.eveningAchievements?.whatsappStatus === true ? true : (todaysTask?.eveningAchievements?.whatsappStatus === false ? false : prev.evening.whatsappStatus),
        emailWorking: todaysTask?.eveningAchievements?.emailWorking != null ? String(todaysTask.eveningAchievements.emailWorking) : prev.evening.emailWorking,
        buyersWorking: todaysTask?.eveningAchievements?.buyersWorking != null ? String(todaysTask.eveningAchievements.buyersWorking) : prev.evening.buyersWorking,
        sellersWorking: todaysTask?.eveningAchievements?.sellersWorking != null ? String(todaysTask.eveningAchievements.sellersWorking) : prev.evening.sellersWorking,
        meetingVisits: todaysTask?.meetingVisits != null ? String(todaysTask.meetingVisits) : prev.evening.meetingVisits,
        addNote: todaysTask?.addNotes || prev.evening.addNote
      }
    }));
  }, [todaysTask]);

  // Removed daily reset logic since API data automatically reflects new day state

  // Validation helper
  const validateMorningForm = () => {
    const { morning } = formData;
    const errors = [];

    // For boolean fields, check if user has made a selection (not the initial state)
    // We need to track if user actually clicked a radio button
    if (morning.onlinePortal === null || morning.onlinePortal === undefined) {
      errors.push('Please select Online Portal Checking status');
    }
    if (morning.whatsappStatus === null || morning.whatsappStatus === undefined) {
      errors.push('Please select WhatsApp Status');
    }
    if (!morning.emailWorking || morning.emailWorking.toString().trim() === '') {
      errors.push('Please enter Email Working count');
    }
    if (!morning.buyersWorking || morning.buyersWorking.trim() === '') {
      errors.push('Please enter Buyers Working count');
    }
    if (!morning.sellersWorking || morning.sellersWorking.trim() === '') {
      errors.push('Please enter Sellers Working count');
    }
    if (!morning.meetingVisits || morning.meetingVisits.trim() === '') {
      errors.push('Please enter Meeting/Visits count');
    }

    return errors;
  };

  const validateEveningForm = () => {
    const { evening } = formData;
    const errors = [];

    if (evening.onlinePortal === null || evening.onlinePortal === undefined) {
      errors.push('Please select Online Portal Checking status');
    }
    if (evening.whatsappStatus === null || evening.whatsappStatus === undefined) {
      errors.push('Please select WhatsApp Status');
    }
    if (!evening.emailWorking || evening.emailWorking.toString().trim() === '') {
      errors.push('Please enter Email Working count');
    }
    if (!evening.buyersWorking || evening.buyersWorking.trim() === '') {
      errors.push('Please enter Buyers Working count');
    }
    if (!evening.sellersWorking || evening.sellersWorking.trim() === '') {
      errors.push('Please enter Sellers Working count');
    }
    if (!evening.meetingVisits || evening.meetingVisits.trim() === '') {
      errors.push('Please enter Meeting/Visits count');
    }

    return errors;
  };

  // Morning submission handler
  const handleMorningSubmit = async () => {
    const errors = validateMorningForm();
    if (errors.length > 0) {
      toast.error('Please fill in all required fields:\n' + errors.join('\n'));
      return;
    }

    try {
      const taskData = {
        date: new Date().toISOString().split('T')[0],
        name: user?.name || user?.firstName || user?.username || 'User',
        morningCommitment: {
          onlinePortalChecked: formData.morning.onlinePortal,
          whatsappStatus: formData.morning.whatsappStatus,
          emailWorking: parseInt(formData.morning.emailWorking) || 0,
          buyersWorking: formData.morning.buyersWorking,
          sellersWorking: formData.morning.sellersWorking,
        }
      };

      // Find if there's already a task for today
      const today = new Date().toDateString();
      const existingTask = dailyTasksData?.find(task => {
        const taskDate = new Date(task.date || task.createdAt).toDateString();
        return taskDate === today;
      });

      if (existingTask && existingTask._id) {
        await updateDailyTask.mutateAsync({ id: existingTask._id, taskData });
      } else {
        await createDailyTask.mutateAsync(taskData);
      }
      
      queryClient.invalidateQueries({ queryKey: ["dailyTasks"] });
      queryClient.invalidateQueries({ queryKey: ["todaysDailyTask"] });
      
      toast.success('Morning commitments submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting morning commitments:', error.response?.data?.message || error.message);
      toast.error(`Failed to submit morning commitments: ${error.response?.data?.message || error.message}`);
    }
  };

  // Evening submission handler
  const handleEveningSubmit = async () => {
    const errors = validateEveningForm();
    if (errors.length > 0) {
      toast.error('Please fill in all required fields:\n' + errors.join('\n'));
      return;
    }

    try {
      // Debug: show today's task and admin list to help diagnose lookup issues
      console.debug('handleEveningSubmit - todaysTask:', todaysTask);
      console.debug('handleEveningSubmit - dailyTasksData sample length:', dailyTasksData?.length);

      // Prefer the user-specific `todaysTask` (from useTodaysDailyTask) when available.
      // Fallback to searching the admin list `dailyTasksData` to keep existing behavior.
      const today = new Date().toISOString().split('T')[0];
      let existingTask = todaysTask && (todaysTask._id || todaysTask.id) ? todaysTask : null;
      if (!existingTask) {
        existingTask = dailyTasksData?.find(task => {
          const taskDate = task.date || (task.createdAt ? (task.createdAt.split ? task.createdAt.split('T')[0] : task.createdAt) : null);
          return taskDate === today && (task.name === (user?.name || user?.firstName || user?.username || 'User'));
        });
      }

      if (!existingTask || !existingTask._id) {
        toast.error('Error: No morning commitment found. Please submit morning commitments first.');
        return;
      }

      const eveningData = {
        eveningAchievements: {
          onlinePortalChecked: formData.evening.onlinePortal,
          whatsappStatus: formData.evening.whatsappStatus,
          emailWorking: parseInt(formData.evening.emailWorking) || 0,
          buyersWorking: formData.evening.buyersWorking,
          sellersWorking: formData.evening.sellersWorking,
          meetingVisits: formData.evening.meetingVisits,
          addNotes: formData.evening.addNote
        }
      };

      await updateDailyTask.mutateAsync({ 
        id: existingTask._id, 
        taskData: eveningData 
      });
      
      queryClient.invalidateQueries({ queryKey: ["dailyTasks"] });
      queryClient.invalidateQueries({ queryKey: ["todaysDailyTask"] });
      
      toast.success('Evening achievements submitted successfully!');
    } catch (error) {
      console.error('Error submitting evening achievements:', error.response?.data?.message || error.message);
      toast.error(`Failed to submit evening achievements: ${error.response?.data?.message || error.message}`);
    }
  };

  // Clear form handlers
  const handleMorningClear = () => {
    setFormData(prev => ({
      ...prev,
      morning: {
        onlinePortal: null, // Reset to null to indicate no selection
        whatsappStatus: null, // Reset to null to indicate no selection
        emailWorking: '',
        buyersWorking: '',
        sellersWorking: '',
        meetingVisits: '',
        addNote: ''
      }
    }));
  };

  const handleEveningClear = () => {
    setFormData(prev => ({
      ...prev,
      evening: {
        onlinePortal: null, // Reset to null to indicate no selection
        whatsappStatus: null, // Reset to null to indicate no selection
        emailWorking: '',
        buyersWorking: '',
        sellersWorking: '',
        meetingVisits: '',
        addNote: ''
      }
    }));
  };

  // Determine if user is admin based on userRole prop or user context
  const isAdmin = userRole === 'admin' || user?.role === 'admin';

  // Handle navigation to Daily Plan page
  const handleViewAll = () => {
    navigate('/daily-plan');
  };

  // Handle notes popup
  const handleNotesClick = (notes) => {
    setSelectedNotes(notes || "No notes available");
    setIsNotesPopupOpen(true);
  };

  // Transform API data to match the expected format
  const transformedData = dailyTasksData.map(task => ({
    name: task.name,
    morning: {
      commitment: "Morning Commitment",
      portal: task.morningCommitment?.onlinePortalChecked === true ? "true" : task.morningCommitment?.onlinePortalChecked === false ? "false" : "--",
      whatsapp: task.morningCommitment?.whatsappStatus === true ? "true" : task.morningCommitment?.whatsappStatus === false ? "false" : "--",
      buyers: task.morningCommitment?.buyersWorking ?? "--",
      sellers: task.morningCommitment?.sellersWorking ?? "--",
      met: task.meetingVisits ?? "--",
      email: task.morningCommitment?.emailWorking ?? "--"
    },
    evening: {
      commitment: "Evening Achievements",
      portal: task.eveningAchievements?.onlinePortalChecked === true ? "true" : task.eveningAchievements?.onlinePortalChecked === false ? "false" : "--",
      whatsapp: task.eveningAchievements?.whatsappStatus === true ? "true" : task.eveningAchievements?.whatsappStatus === false ? "false" : "--",
      buyers: task.eveningAchievements?.buyersWorking ?? "--",
      sellers: task.eveningAchievements?.sellersWorking ?? "--",
      met: task.meetingVisits ?? "--",
      email: task.eveningAchievements?.emailWorking ?? "--"
    },
    date: task.date,
    notes: task.addNotes,
    id: task._id || task.id
  }));

  const data = useMemo(() => {
    return transformedData.length > 0 ? transformedData : [];
  }, [transformedData]);

  // 🔍 Filtering
  const filteredData = useMemo(() => {
    if (isDashboard) return data; // Skip filtering for dashboard
    
    return data.filter((task) => {
      const searchableValues = [
        task.name,
        task.date,
        task.notes || "",
        String(task.morning.portal),
        String(task.morning.whatsapp),
        String(task.morning.email),
        String(task.evening.portal),
        String(task.evening.whatsapp),
        String(task.evening.email)
      ];
      
      return searchableValues.some(value => 
        String(value).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, search, isDashboard]);

  // ✅ Sorting
  const sortedData = useMemo(() => {
    if (isDashboard || !sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let valA, valB;
      
      // Handle nested properties like 'morning.portal'
      if (sortConfig.key.includes('.')) {
        const [section, field] = sortConfig.key.split('.');
        valA = String(a[section]?.[field] ?? "").toLowerCase();
        valB = String(b[section]?.[field] ?? "").toLowerCase();
      } else {
        valA = String(a[sortConfig.key] ?? "").toLowerCase();
        valB = String(b[sortConfig.key] ?? "").toLowerCase();
      }
      
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, isDashboard]);

  // 📄 Pagination
  const displayData = sortedData; // Show all data for both dashboard and full view
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = isDashboard 
    ? displayData // Show all entries in dashboard with scrolling
    : displayData.slice(indexOfFirstRow, indexOfLastRow);

  // 📌 Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };





  // Handle loading state
  if (!isDashboard && isLoading) {
    return (
      <section className="rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading daily tasks...</span>
        </div>
      </section>
    );
  }

  // Handle error state
  if (!isDashboard && isError) {
    return (
      <section className="rounded-lg p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load daily tasks</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
        </div>
      </section>
    );
  }

  // Empty state for full page - only when no data at all AND no search term
  if (!isDashboard && data.length === 0 && !search.trim()) {
    return (
      <section className="rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Today's Tasks</h2>
        </div>
        
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">No daily tasks available at the moment</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg">
      {/* User Form View - Show for regular users */}
      {!isAdmin ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-2xl cursor-pointer">
              Today's Task
            </h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <button 
                onClick={handleViewAll}
                className="flex items-center gap-1 hover:text-cyan-600 transition-colors"
              >
                View All <ExternalLink size={16} />
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          {workflowState.showSubmissionStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <CheckSquare size={20} className="text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    {submissionStatus === 'morning' ? 'Morning Commitments Submitted' : 'All Tasks Completed for Today'}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {submissionStatus === 'morning' 
                      ? 'You can now fill in your evening achievements' 
                      : 'Both morning and evening submissions are complete. See you tomorrow!'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Layout */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Morning Commitment */}
            <div className={`flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
              !workflowState.morningEnabled ? 'opacity-60 pointer-events-none' : ''
            }`}>
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Morning Commitment
                </h3>
                {submissionStatus === 'morning' || submissionStatus === 'both' ? (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    ✓ Submitted
                  </span>
                ) : null}
              </div>
              
              <div className="space-y-6">
                {/* Online Portal Checking */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Online Portal Checking
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">Yes</span>
                      <input
                        type="radio"
                        name="morningPortal"
                        value="yes"
                        checked={formData.morning.onlinePortal === true}
                        onChange={() => workflowState.morningEnabled && setFormData(prev => ({
                          ...prev,
                          morning: { ...prev.morning, onlinePortal: true }
                        }))}
                        disabled={!workflowState.morningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">No</span>
                      <input
                        type="radio"
                        name="morningPortal"
                        value="no"
                        checked={formData.morning.onlinePortal === false}
                        onChange={() => workflowState.morningEnabled && setFormData(prev => ({
                          ...prev,
                          morning: { ...prev.morning, onlinePortal: false }
                        }))}
                        disabled={!workflowState.morningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>

                {/* WhatsApp Status */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    WhatsApp Status / Post in Group
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">Yes</span>
                      <input
                        type="radio"
                        name="morningWhatsapp"
                        value="yes"
                        checked={formData.morning.whatsappStatus === true}
                        onChange={() => workflowState.morningEnabled && setFormData(prev => ({
                          ...prev,
                          morning: { ...prev.morning, whatsappStatus: true }
                        }))}
                        disabled={!workflowState.morningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">No</span>
                      <input
                        type="radio"
                        name="morningWhatsapp"
                        value="no"
                        checked={formData.morning.whatsappStatus === false}
                        onChange={() => workflowState.morningEnabled && setFormData(prev => ({
                          ...prev,
                          morning: { ...prev.morning, whatsappStatus: false }
                        }))}
                        disabled={!workflowState.morningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>

                {/* Email Working */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Email Working on
                  </label>
                  <input
                    type="number"
                    placeholder="Enter number"
                    value={formData.morning.emailWorking}
                    onChange={(e) => workflowState.morningEnabled && setFormData(prev => ({
                      ...prev,
                      morning: { ...prev.morning, emailWorking: e.target.value }
                    }))}
                    disabled={!workflowState.morningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Buyers Working */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Buyers Working
                  </label>
                  <input
                    type="text"
                    placeholder="No. of Buyers Working"
                    value={formData.morning.buyersWorking}
                    onChange={(e) => workflowState.morningEnabled && setFormData(prev => ({
                      ...prev,
                      morning: { ...prev.morning, buyersWorking: e.target.value }
                    }))}
                    disabled={!workflowState.morningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Sellers Working */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Sellers Working
                  </label>
                  <input
                    type="text"
                    placeholder="No. of Sellers Working"
                    value={formData.morning.sellersWorking}
                    onChange={(e) => workflowState.morningEnabled && setFormData(prev => ({
                      ...prev,
                      morning: { ...prev.morning, sellersWorking: e.target.value }
                    }))}
                    disabled={!workflowState.morningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Meeting / Visits */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Meeting / Visits
                  </label>
                  <input
                    type="text"
                    placeholder="No. of Meeting / Visits"
                    value={formData.morning.meetingVisits}
                    onChange={(e) => workflowState.morningEnabled && setFormData(prev => ({
                      ...prev,
                      morning: { ...prev.morning, meetingVisits: e.target.value }
                    }))}
                    disabled={!workflowState.morningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Add Note */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Add Note
                  </label>
                  <textarea
                    placeholder="Add Note"
                    value={formData.morning.addNote}
                    onChange={(e) => workflowState.morningEnabled && setFormData(prev => ({
                      ...prev,
                      morning: { ...prev.morning, addNote: e.target.value }
                    }))}
                    disabled={!workflowState.morningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={handleMorningClear}
                  disabled={!workflowState.morningEnabled}
                  className="px-6 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button 
                  onClick={handleMorningSubmit}
                  disabled={!workflowState.morningEnabled || updateDailyTask.isPending}
                  className="px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateDailyTask.isPending ? 'Submitting...' : 'Confirm'}
                </button>
              </div>
            </div>

            {/* Evening Achievements */}
            <div className={`flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
              !workflowState.eveningEnabled ? 'opacity-60 pointer-events-none' : ''
            }`}>
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Evening Achievements
                </h3>
                {submissionStatus === 'both' ? (
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    ✓ Submitted
                  </span>
                ) : null}
              </div>
              
              <div className="space-y-6">
                {/* Online Portal Checking */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Online Portal Checking
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">Yes</span>
                      <input
                        type="radio"
                        name="eveningPortal"
                        value="yes"
                        checked={formData.evening.onlinePortal === true}
                        onChange={() => workflowState.eveningEnabled && setFormData(prev => ({
                          ...prev,
                          evening: { ...prev.evening, onlinePortal: true }
                        }))}
                        disabled={!workflowState.eveningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">No</span>
                      <input
                        type="radio"
                        name="eveningPortal"
                        value="no"
                        checked={formData.evening.onlinePortal === false}
                        onChange={() => workflowState.eveningEnabled && setFormData(prev => ({
                          ...prev,
                          evening: { ...prev.evening, onlinePortal: false }
                        }))}
                        disabled={!workflowState.eveningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>

                {/* WhatsApp Status */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    WhatsApp Status / Post in Group
                  </label>
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">Yes</span>
                      <input
                        type="radio"
                        name="eveningWhatsapp"
                        value="yes"
                        checked={formData.evening.whatsappStatus === true}
                        onChange={() => workflowState.eveningEnabled && setFormData(prev => ({
                          ...prev,
                          evening: { ...prev.evening, whatsappStatus: true }
                        }))}
                        disabled={!workflowState.eveningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                    <label className="flex-1 flex items-center justify-between cursor-pointer px-4 py-3 border rounded-lg transition-all bg-gray-50 hover:bg-gray-100 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 font-medium">
                      <span className="text-sm font-medium text-gray-700">No</span>
                      <input
                        type="radio"
                        name="eveningWhatsapp"
                        value="no"
                        checked={formData.evening.whatsappStatus === false}
                        onChange={() => workflowState.eveningEnabled && setFormData(prev => ({
                          ...prev,
                          evening: { ...prev.evening, whatsappStatus: false }
                        }))}
                        disabled={!workflowState.eveningEnabled}
                        className="w-4 h-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>

                {/* Email Working */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Email Working on
                  </label>
                  <input
                    type="number"
                    placeholder="Enter number"
                    value={formData.evening.emailWorking}
                    onChange={(e) => workflowState.eveningEnabled && setFormData(prev => ({
                      ...prev,
                      evening: { ...prev.evening, emailWorking: e.target.value }
                    }))}
                    disabled={!workflowState.eveningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Buyers Working */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Buyers Working
                  </label>
                  <input
                    type="text"
                    placeholder="No. of Buyers Working"
                    value={formData.evening.buyersWorking}
                    onChange={(e) => workflowState.eveningEnabled && setFormData(prev => ({
                      ...prev,
                      evening: { ...prev.evening, buyersWorking: e.target.value }
                    }))}
                    disabled={!workflowState.eveningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Sellers Working */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Sellers Working
                  </label>
                  <input
                    type="text"
                    placeholder="No. of Sellers Working"
                    value={formData.evening.sellersWorking}
                    onChange={(e) => workflowState.eveningEnabled && setFormData(prev => ({
                      ...prev,
                      evening: { ...prev.evening, sellersWorking: e.target.value }
                    }))}
                    disabled={!workflowState.eveningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Meeting / Visits */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Meeting / Visits
                  </label>
                  <input
                    type="text"
                    placeholder="No. of Meeting / Visits"
                    value={formData.evening.meetingVisits}
                    onChange={(e) => workflowState.eveningEnabled && setFormData(prev => ({
                      ...prev,
                      evening: { ...prev.evening, meetingVisits: e.target.value }
                    }))}
                    disabled={!workflowState.eveningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Add Note */}
                <div className="space-y-3">
                  <label className="block text-base font-medium text-gray-700">
                    Add Note
                  </label>
                  <textarea
                    placeholder="Add Note"
                    value={formData.evening.addNote}
                    onChange={(e) => workflowState.eveningEnabled && setFormData(prev => ({
                      ...prev,
                      evening: { ...prev.evening, addNote: e.target.value }
                    }))}
                    disabled={!workflowState.eveningEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={handleEveningClear}
                  disabled={!workflowState.eveningEnabled}
                  className="px-6 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button 
                  onClick={handleEveningSubmit}
                  disabled={!workflowState.eveningEnabled || updateDailyTask.isPending}
                  className="px-6 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateDailyTask.isPending ? 'Submitting...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Admin Table View - Show existing table for admins */
        <div>
          {/* Header - Always show, but button only on full page */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-2xl cursor-pointer">
              Today's Task
            </h2>
            <div className="flex gap-4 text-sm text-gray-600">
              {/* Admin header actions removed per request (View All / Filter / Download PDF) */}
            </div>
          </div>

      

      {/* Conditional Search and Filter Controls - Only show on full page */}
      {!isDashboard && (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full md:w-1/3">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {/* rows-per-page removed from controls; pagination will render an inline select */}
        </div>
      )}
   
      {/* Table */}
      <div className={`overflow-x-auto rounded-2xl bg-white ${isDashboard ? 'h-96 overflow-y-auto border-none' : 'min-h-[45vh]'}`}>
        <table className="w-full text-sm border-collapse">
          {/* Conditional Table Header - Only show on full page */}
        
            <thead className="sticky top-0 z-20 bg-[#FAFBFC]">
              <tr className="bg-[#FAFBFC] text-gray-700">
                <th className="px-6 py-6 text-sm text-center whitespace-nowrap bg-[#FAFBFC] font-medium w-16 theading">
                  S.No
                </th>
                <th
                  className="min-w-32 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium"
                  style={{ minWidth: 180 }}
                  onClick={() => handleSort('name')}
                >
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 text-sm text-left whitespace-nowrap bg-[#FAFBFC] font-medium">Promises</th>
                <th 
                  className="px-4 text-sm text-center cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium"
                  onClick={() => handleSort('morning.portal')}
                >
                  Online Portal Checked {sortConfig.key === 'morning.portal' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-4 text-sm text-center cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium"
                  onClick={() => handleSort('morning.whatsapp')}
                >
                  Whatsapp Status/ Post  {sortConfig.key === 'morning.whatsapp' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-4 text-sm text-center cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium"
                  onClick={() => handleSort('morning.email')}
                >
                  Email Working {sortConfig.key === 'morning.email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-4 text-sm text-center cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium"
                  onClick={() => handleSort('morning.buyers')}
                >
                  Buyers Working {sortConfig.key === 'morning.buyers' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-4 text-sm text-center cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium"
                  onClick={() => handleSort('morning.sellers')}
                >
                  Sellers Working {sortConfig.key === 'morning.sellers' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-4 text-sm text-center cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium"
                  onClick={() => handleSort('morning.met')}
                >
                  Meeting {sortConfig.key === 'morning.met' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 text-sm text-center whitespace-nowrap bg-[#FAFBFC] font-medium">Notes</th>
              </tr>
            </thead>
          
          <tbody className="">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={isDashboard ? 10 : 10} className="border-t-4 border-b-4 border-white px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <CheckSquare size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {search.trim() ? 'No matching tasks found' : 'No tasks found'}
                    </h3>
                    <p className="text-gray-500">
                      {search.trim() ? `Try adjusting your search term "${search}"` : 'Get started by adding your first daily task'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentRows.map((person, idx) => (
                <React.Fragment key={idx}>
                  <tr className="bg-[#FFF4BD]">
                    {/* Serial number replacing checkbox */}
                    <td className="border-t-4 border-b-4 border-white px-6 py-4 text-center bg-[#FFF4BD]" rowSpan={2}>
                      {isDashboard ? idx + 1 : (currentPage - 1) * rowsPerPage + idx + 1}
                    </td>
                    <td className="border-t-4 border-b-4 border-white font-medium text-gray-800 whitespace-nowrap bg-[#FFF4BD]" rowSpan={2}>
                      {person.name}
                    </td>
                    <td className="border-t-4 border-b-4 border-white py-4 px-4 font-medium whitespace-nowrap">{person.morning.commitment}</td>
                    <td className="border-t-4 border-b-4 border-white py-4 whitespace-nowrap text-center">{person.morning.portal}</td>
                    <td className="border-t-4 border-b-4 border-white py-4 whitespace-nowrap text-center">{person.morning.whatsapp}</td>
                    <td className="border-t-4 border-b-4 border-white py-4 whitespace-nowrap text-center">{person.morning.email}</td>
                    <td className="border-t-4 border-b-4 border-white py-4 whitespace-nowrap text-center">{person.morning.buyers}</td>
                    <td className="border-t-4 border-b-4 border-white py-4 whitespace-nowrap text-center">{person.morning.sellers}</td>
                    <td className="border-t-4 border-b-4 border-white py-4 whitespace-nowrap text-center">{person.morning.met}</td>
                    <td className="border-t-4 border-b-4 border-white py-4 text-center whitespace-nowrap place-items-center">
                      <div className="relative group">
                        <NotebookPen 
                          size={18} 
                          className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" 
                          onClick={() => handleNotesClick(person.notes)}
                        />
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none max-w-48">
                          <div className="truncate">
                            {person.notes || "No notes available"}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#FFC6C7]">
                    <td className="border-t-4 border-b-4 border-white px-4 py-4 font-medium whitespace-nowrap">{person.evening.commitment}</td>
                    <td className="border-t-4 border-b-4 border-white text-center py-4 whitespace-nowrap">{person.evening.portal}</td>
                    <td className="border-t-4 border-b-4 border-white text-center py-4 whitespace-nowrap">{person.evening.whatsapp}</td>
                    <td className="border-t-4 border-b-4 border-white text-center py-4 whitespace-nowrap">{person.evening.email}</td>
                    <td className="border-t-4 border-b-4 border-white text-center py-4 whitespace-nowrap">{person.evening.buyers}</td>
                    <td className="border-t-4 border-b-4 border-white text-center py-4 whitespace-nowrap">{person.evening.sellers}</td>
                    <td className="border-t-4 border-b-4 border-white text-center py-4 whitespace-nowrap">{person.evening.met}</td>
                    <td className="border-t-4 border-b-4 border-white px-24 py-4 text-center whitespace-nowrap place-items-center">
                      <div className="relative group">
                        <NotebookPen 
                          size={18} 
                          className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" 
                          onClick={() => handleNotesClick(person.notes)}
                        />
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none max-w-48">
                          <div className="truncate">
                            {person.notes || "No notes available"}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Conditional Pagination - Only show on full page */}
      {!isDashboard && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <span>Showing {Math.min((currentPage - 1) * rowsPerPage + 1, displayData.length)} -</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border rounded px-2 py-1 text-sm"
            >
              {[4,8,12,20].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>of {displayData.length}</span>
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              disabled={currentPage * rowsPerPage >= displayData.length}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Notes Popup Modal */}
      {isNotesPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white  px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <NotebookPen size={20} className="text-blue-500" />
                Task Notes
              </h2>
              <button
                onClick={() => {
                  setIsNotesPopupOpen(false);
                  setSelectedNotes("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 ">
             <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedNotes}
                </div>
            </div>

            {/* Footer */}
            <div className=" px-6 py-4  rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsNotesPopupOpen(false);
                    setSelectedNotes("");
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Enhanced scrollbar style for better appearance */}

    </section>
  );
};

export default TodaysTask;

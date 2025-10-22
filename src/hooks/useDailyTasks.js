import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Hook to fetch today's daily task for current user
export const useTodaysDailyTask = (userName = "User") => {
  return useQuery({
    queryKey: ["todaysDailyTask", userName],
    queryFn: async () => {
      try {
  // Use GET to fetch today's tasks for all users (admin endpoint)
  // This hits: /api/dailytask/task/today
  const response = await api.get("/dailytask/task/today");
        // Normalize response: server may return { success, count, data: { name: [tasks] } }
        let allTasks = [];
        if (response?.data?.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
          // flatten all arrays inside the data object
          Object.values(response.data.data).forEach((arr) => {
            if (Array.isArray(arr)) allTasks.push(...arr);
          });
        } else if (Array.isArray(response.data)) {
          allTasks = response.data;
        } else if (Array.isArray(response.data.data)) {
          allTasks = response.data.data;
        } else if (response.data) {
          // fallback: if it's a single object
          allTasks = [response.data];
        }

        const today = new Date().toISOString().slice(0, 10);
        const todaysTask = allTasks.find(task => {
          const taskDate = (task?.date || task?.createdAt || '').slice(0, 10);
          return String(task?.name).toLowerCase() === String(userName).toLowerCase() && taskDate === today;
        });
        return todaysTask || null;
      } catch (error) {
        console.error('Error fetching today\'s task (GET /task):', error.message);
        return null;
      }
    },
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

// Hook to fetch daily tasks for all users (admin)
export const useDailyTasks = () => {
  return useQuery({
    queryKey: ["dailyTasks"],
    queryFn: async () => {
      try {
  // Use GET to fetch today's tasks for all users (admin endpoint)
  // This hits: /api/dailytask/task/today
  const response = await api.get("/dailytask/task/today");
        // Normalize like in useTodaysDailyTask
        let allTasks = [];
        if (response?.data?.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
          Object.values(response.data.data).forEach((arr) => {
            if (Array.isArray(arr)) allTasks.push(...arr);
          });
        } else if (Array.isArray(response.data)) {
          allTasks = response.data;
        } else if (Array.isArray(response.data.data)) {
          allTasks = response.data.data;
        } else if (response.data) {
          allTasks = [response.data];
        }
        return allTasks;
      } catch (error) {
        console.error('Error fetching daily tasks (GET /task):', error.message);
        return [];
      }
    },
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useCreateDailyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData) => {
      const response = await api.post("/dailytask/task", taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyTasks"] });
      queryClient.invalidateQueries({ queryKey: ["todaysDailyTask"] });
    },
    onError: (error) => {
      console.error("Failed to create daily task:", error.response?.data?.message || error.message);
    },
  });
};

// Hook to update a daily task
export const useUpdateDailyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, taskData }) => {
      const response = await api.put(`/dailytask/task/${id}`, taskData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyTasks"] });
      queryClient.invalidateQueries({ queryKey: ["todaysDailyTask"] });
    },
    onError: (error) => {
      console.error("Failed to update daily task:", error.response?.data?.message || error.message);
    },
  });
};


// Hook to fetch all daily plans for a specific user (all time)
export const useUserAllDailyPlans = (userName = "User") => {
  return useQuery({
    queryKey: ["userAllDailyPlans", userName],
    queryFn: async () => {
      try {
        const response = await api.post("/dailytask/task/byname", {
          name: userName
        });
        if (response.data.success) {
          return response.data.data || [];
        }
        return [];
      } catch (error) {
        console.error("Error fetching all daily plans for user:", error.message);
        return [];
      }
    },
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
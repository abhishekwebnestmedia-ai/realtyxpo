import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Hook to fetch today's daily task for current user
export const useTodaysDailyTask = (userName = "User") => {
  return useQuery({
    queryKey: ["todaysDailyTask", userName],
    queryFn: async () => {
      try {
        // Use GET to fetch all tasks, then filter for today and user
        const response = await api.get("/dailytask/task");
        const allTasks = Array.isArray(response.data) ? response.data : [response.data];
        const today = new Date().toISOString().slice(0, 10);
        const todaysTask = allTasks.find(task => {
          const taskDate = task.date ? task.date.slice(0, 10) : null;
          return task.name === userName && taskDate === today;
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
        // Use GET to fetch all daily tasks
        const response = await api.get("/dailytask/task");
        return Array.isArray(response.data) ? response.data : [response.data];
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


// Hook to create a daily task
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
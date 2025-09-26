import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Hook to fetch daily tasks
export const useDailyTasks = () => {
  return useQuery({
    queryKey: ["dailyTasks"],
    queryFn: async () => {
      const response = await api.get("/dailytask/task");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a daily task
export const useCreateDailyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData) => {
      const response = await api.post("/dailytask/task", taskData);
      console.log(response.data)
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch daily tasks
      queryClient.invalidateQueries({ queryKey: ["dailyTasks"] });
    },
    onError: (error) => {
      console.error("Failed to create daily task:", error);
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
    },
    onError: (error) => {
      console.error("Failed to update daily task:", error);
    },
  });
};
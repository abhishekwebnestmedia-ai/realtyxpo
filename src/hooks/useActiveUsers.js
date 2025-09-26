import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

export const useActiveUsers = () => {
  return useQuery({
    queryKey: ["activeUsers"],
    queryFn: async () => {
      const response = await api.get("/auth/activeuser");
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};
import { useQuery } from "@tanstack/react-query";
import api from "../api/api"; // <-- your axios instance with token interceptor

// Custom hook for fetching inventory
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],  // cache key for React Query
    queryFn: async () => {
      const res = await api.get("/inventry/inventrylist"); 
      // console.log(res.data);
      return res.data; // return backend response
    },
    staleTime: 1000 * 60 * 5,   // 5 mins = fresh, then background refetch
    refetchOnWindowFocus: false // prevent refetch every tab focus
  });
};

import { useQuery } from "@tanstack/react-query";
import api from "../api/api"; // <-- your axios instance with token interceptor

// Custom hook for fetching inventory
export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],  // cache key for React Query
    queryFn: async () => {
      const res = await api.get("/inventry/inventrylist");
      const payload = res.data;

      // Normalize to array for consumers that expect a list
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.docs)) return payload.docs;
      if (Array.isArray(payload?.inventory)) return payload.inventory;

      // unexpected shape -> return empty array (consumer will show empty state)
      // still helpful to log in dev
      if (payload && Object.keys(payload).length > 0) {
        console.warn('useInventory: unexpected response shape from /inventry/inventrylist', payload);
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,   // 5 mins = fresh, then background refetch
    refetchOnWindowFocus: false // prevent refetch every tab focus
  });
};

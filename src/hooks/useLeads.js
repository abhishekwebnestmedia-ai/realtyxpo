// hooks/useLeads.js
import { useQuery } from "@tanstack/react-query";
import api from "../api/api"; // your axios instance

const fetchLeads = async () => {
  const { data } = await api.get("/realtleads/getlead");
  // console.log('Fetched leads data:', data); 
  return data;
};
 
export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],   // unique cache key
    queryFn: fetchLeads,   // the function to run
    staleTime: 5 * 60 * 1000, // cache valid for 5 min
  });
};

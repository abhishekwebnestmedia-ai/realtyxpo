import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

const fetchBrokers = async () => {
  const { data } = await api.get("/broker");
  return data;
};

export const useBrokers = () => {
  return useQuery({
    queryKey: ["brokers"],
    queryFn: fetchBrokers,
    staleTime: 5 * 60 * 1000, // cache valid for 5 min
    refetchOnWindowFocus: false
  });
};
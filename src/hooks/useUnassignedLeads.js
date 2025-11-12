import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

const fetchUnassignedLeads = async () => {
  const { data } = await api.get('/realtleads/unassigned');
  return data;
};

export const useUnassignedLeads = () => {
  return useQuery({
    queryKey: ['unassignedLeads'],
    queryFn: fetchUnassignedLeads,
    staleTime: 2 * 60 * 1000,
  });
};

export default useUnassignedLeads;

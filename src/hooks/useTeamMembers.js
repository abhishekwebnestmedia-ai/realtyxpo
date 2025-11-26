import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

const fetchTeamMembers = async () => {
  const response = await api.get('/auth/teams');
  
  let usersData = [];
  if (response.data?.users && Array.isArray(response.data.users)) {
    usersData = response.data.users;
  } else if (Array.isArray(response.data)) {
    usersData = response.data;
  } else if (response.data?.data && Array.isArray(response.data.data)) {
    usersData = response.data.data;
  }
  
  return usersData;
};

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: fetchTeamMembers,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });
};

export default useTeamMembers;

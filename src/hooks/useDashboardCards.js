import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

const normalizeCardPayload = (payload) => {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.cards)) {
    return payload.cards;
  }

  return [];
};

const fetchDashboardCards = async () => {
  const response = await api.get('/card');
  const list = normalizeCardPayload(response.data);

  return list.map((item = {}) => ({
    title: typeof item.title === 'string' ? item.title : '',
    value: Number(item.value) || 0,
  }));
};

export const useDashboardCards = () => {
  const query = useQuery({
    queryKey: ['dashboard', 'cards'],
    queryFn: fetchDashboardCards,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const cardMap = useMemo(() => {
    if (!Array.isArray(query.data)) {
      return {};
    }

    return query.data.reduce((acc, item) => {
      const key = item.title.trim();
      if (key) {
        acc[key] = item.value;
      }
      return acc;
    }, {});
  }, [query.data]);

  return {
    ...query,
    cardMap,
  };
};

export default useDashboardCards;

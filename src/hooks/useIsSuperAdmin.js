import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useIsSuperAdmin() {
  const { user } = useContext(AuthContext) || {};
  // normalize various shapes safely
  return useMemo(() => Boolean(user?.permissions?.superAdmin), [user]);
}

import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminBroadCast from '../../components/Brodacast/AdminBroadCast';
import UserBroadCast from '../../components/Brodacast/UserBroadCast';

const Broadcast = () => {
  const { user } = useContext(AuthContext);
  
  // Determine which broadcast component to show based on user role
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  return (
    <div className=" flex flex-col overflow-hidden">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {isAdmin ? 'Admin Broadcast' : 'Team Communication'}
        </h1>
       
      </div>
      
      <div className="flex-1 min-h-0">
        {isAdmin ? <AdminBroadCast /> : <UserBroadCast />}
      </div>
    </div>
  );
};

export default Broadcast;
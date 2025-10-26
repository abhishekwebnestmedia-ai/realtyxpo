import React, { useContext, Suspense } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getViewerPerms } from '../../utils/permissions';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const RoleBasedRoute = ({ 
  children, 
  adminComponent: AdminComponent, 
  userComponent: UserComponent,
  fallbackComponent: FallbackComponent,
  requiredPermissions = [],
  adminOnly = false,
  userOnly = false
}) => {
  const { user } = useContext(AuthContext);
  const viewerPerms = getViewerPerms(user);
  
  // Check if user has required permissions
  const hasRequiredPermissions = requiredPermissions.length === 0 || 
    requiredPermissions.some(permission => viewerPerms[permission]);
  
  // Determine if user is admin
  const isAdmin = viewerPerms.superAdmin || user?.role === 'admin';
  const isUser = !isAdmin;
  
  // Handle permission checks
  if (!hasRequiredPermissions) {
    return FallbackComponent ? (
      <Suspense fallback={<LoadingSpinner />}>
        <FallbackComponent />
      </Suspense>
    ) : (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to access this feature.</p>
        </div>
      </div>
    );
  }
  
  // Handle admin-only routes
  if (adminOnly && !isAdmin) {
    return FallbackComponent ? (
      <Suspense fallback={<LoadingSpinner />}>
        <FallbackComponent />
      </Suspense>
    ) : (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
          <p className="text-gray-500">This feature is only available to administrators.</p>
        </div>
      </div>
    );
  }
  
  // Handle user-only routes
  if (userOnly && !isUser) {
    return FallbackComponent ? (
      <Suspense fallback={<LoadingSpinner />}>
        <FallbackComponent />
      </Suspense>
    ) : (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Access Only</h3>
          <p className="text-gray-500">This feature is only available to regular users.</p>
        </div>
      </div>
    );
  }
  
  // Role-based component rendering
  if (AdminComponent && UserComponent) {
    if (isAdmin) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <AdminComponent />
        </Suspense>
      );
    } else {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <UserComponent />
        </Suspense>
      );
    }
  }
  
  // Default: render children
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
};

export default RoleBasedRoute;
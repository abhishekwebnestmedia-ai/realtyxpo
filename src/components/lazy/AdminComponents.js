// Admin-specific components with lazy loading
import { lazy } from 'react';

// Admin Dashboard Components
export const AdminDashboard = lazy(() => import('../dashboard/OverviewDashboard'));

// Admin Team Management
export const AdminMyTeam = lazy(() => import('../team/admin/AdminMyTeam'));
export const AdminUserDetails = lazy(() => import('../team/admin/AdminUserDetails'));

// Admin Lead Management
export const AdminLeads = lazy(() => import('../leads/admin/AdminLeads'));
export const AdminAddLead = lazy(() => import('../forms/admin/AdminAddLead'));
export const AdminEditLead = lazy(() => import('../forms/admin/AdminEditLead'));

// Admin Inventory Management
export const AdminInventory = lazy(() => import('../inventory/admin/AdminInventory'));
export const AdminAddInventory = lazy(() => import('../forms/admin/AdminAddInventory'));

// Admin Broker Requirements
export const AdminBrokerRequirements = lazy(() => import('../resources/admin/AdminBrokerRequirements'));
export const AdminAddBrokerRequirement = lazy(() => import('../resources/admin/AdminAddBrokerRequirement'));
export const AdminEditBrokerRequirement = lazy(() => import('../resources/admin/AdminEditBrokerRequirement'));

// Admin Broadcasting
export const AdminBroadcast = lazy(() => import('../broadcast/admin/AdminBroadcast'));

// Admin Projects
export const AdminProjectsWorking = lazy(() => import('../projects/admin/AdminProjectsWorking'));
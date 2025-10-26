// User-specific components with lazy loading
import { lazy } from 'react';

// User Dashboard Components
export const UserDashboard = lazy(() => import('../dashboard/user/UserDashboard'));

// User Team Management
export const UserMyTeam = lazy(() => import('../team/user/UserMyTeam'));
export const UserUserDetails = lazy(() => import('../team/user/UserUserDetails'));

// User Lead Management
export const UserLeads = lazy(() => import('../leads/user/UserLeads'));
export const UserAddLead = lazy(() => import('../forms/user/UserAddLead'));
export const UserEditLead = lazy(() => import('../forms/user/UserEditLead'));

// User Inventory Management
export const UserInventory = lazy(() => import('../inventory/user/UserInventory'));
export const UserAddInventory = lazy(() => import('../forms/user/UserAddInventory'));

// User Broker Requirements
export const UserBrokerRequirements = lazy(() => import('../resources/user/UserBrokerRequirements'));
export const UserAddBrokerRequirement = lazy(() => import('../resources/user/UserAddBrokerRequirement'));
export const UserEditBrokerRequirement = lazy(() => import('../resources/user/UserEditBrokerRequirement'));

// User Broadcasting
export const UserBroadcast = lazy(() => import('../broadcast/user/UserBroadcast'));

// User Projects
export const UserProjectsWorking = lazy(() => import('../projects/user/UserProjectsWorking'));
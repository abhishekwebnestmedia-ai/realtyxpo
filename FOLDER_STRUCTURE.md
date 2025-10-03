# Improved Folder Structure

## New Structure Overview

```
src/
├── components/
│   ├── ui/
│   │   ├── ToggleSwitch.jsx
│   │   ├── ErrorState.jsx
│   │   ├── Pagination.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── TopBar.jsx
│   │   ├── notifications/
│   │   │   ├── AddSuccess.jsx
│   │   │   ├── ConfirmDelete.jsx
│   │   │   └── toast.js
│   │   └── index.js
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── index.js
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── OverviewDashboard.jsx
│   │   ├── PieChartSection.jsx
│   │   ├── OverallLeadsDetails.jsx
│   │   ├── TeamLeadsAssigned.jsx
│   │   ├── TodaysTask.jsx
│   │   ├── FreshLeads.jsx
│   │   ├── ScrollableLeads.jsx
│   │   ├── LeadsCard.jsx
│   │   └── index.js
│   ├── tables/
│   │   ├── InventoryTable.jsx
│   │   ├── MembersAttendanceTable.jsx
│   │   └── index.js
│   ├── modals/
│   │   ├── AddItemModal.jsx
│   │   ├── AddBulkInventry.jsx
│   │   ├── AddBulkLead.jsx
│   │   ├── AddDailyTaskModal.jsx
│   │   ├── EditInventry.jsx
│   │   └── index.js
│   └── index.js
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── index.js
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx
│   │   └── index.js
│   ├── leads/
│   │   ├── AllLeads.jsx
│   │   ├── FreshLeads.jsx
│   │   ├── AllBuyers.jsx
│   │   └── index.js
│   ├── inventory/
│   │   └── Inventory.jsx
│   ├── forms/
│   │   ├── AddLead.jsx
│   │   ├── EditLead.jsx
│   │   ├── AddInventry.jsx
│   │   ├── components/
│   │   │   ├── Stepperform/
│   │   │   └── Stepperformedit/
│   │   └── index.js
│   ├── projects/
│   │   ├── ProjectsWorking.jsx
│   │   └── index.js
│   ├── team/
│   │   ├── MyTeam.jsx
│   │   └── DailyPlan.jsx
│   └── resources/
├── hooks/
├── context/
├── constants/
├── api/
└── routes/
```

## Benefits of New Structure

### 1. **Logical Component Organization**
- **ui/**: Reusable UI components (ToggleSwitch, Pagination, etc.)
- **layout/**: Layout-specific components (Sidebar, Header, etc.)
- **dashboard/**: Dashboard-specific components
- **tables/**: Data table components
- **modals/**: Modal and popup components

### 2. **Clean Page Structure**
- **auth/**: Authentication pages
- **dashboard/**: Dashboard layout and related pages
- **leads/**: Lead management pages
- **forms/**: Form-related pages with nested components
- **projects/**: Project management pages
- **team/**: Team management pages

### 3. **Barrel Exports**
- Index.js files in each folder for clean imports
- `import { ToggleSwitch, ErrorState } from 'components/ui'`
- `import { Login } from 'pages/auth'`

### 4. **Improved Import Statements**
```javascript
// Before
import ToggleSwitch from '../../components/ToggleSwitch';
import Header from '../../components/Header';
import Dashboard from '../../components/Dashboard';

// After
import { ToggleSwitch } from 'components/ui';
import { Header } from 'components/layout';
import { Dashboard } from 'components/dashboard';
```

### 5. **Better Maintainability**
- Related components are grouped together
- Easy to find and modify specific types of components
- Clear separation of concerns
- Scalable structure for future growth

## Next Steps
- Update remaining import statements across the application
- Consider adding TypeScript for better type safety
- Add proper PropTypes or TypeScript interfaces
- Consider adding Storybook for component documentation
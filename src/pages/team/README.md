# Team Pages Structure

## Files Created:

### 1. `TeamList.jsx` (Main Team Page)
- **Route**: `/team` 
- **Purpose**: Displays all team members in a grid layout
- **Features**:
  - Responsive grid (1-4 columns based on screen size)
  - Profile pictures or initials
  - Click to navigate to user details
  - Loading states and error handling

### 2. `UserDetails.jsx` (Individual User Page)
- **Route**: `/team/member/:userId`
- **Purpose**: Shows detailed view for a specific team member
- **Features**:
  - Back button to return to team list
  - User profile header
  - Primary toggle switches (Leads/Inventory/Daily Plan/Info)
  - Secondary toggle switches (conditional)
  - Data tables and lists
  - Real-time API data fetching

### 3. `MyTeam.jsx` (Wrapper/Compatibility)
- **Purpose**: Maintains backward compatibility
- **Function**: Simple wrapper that renders `TeamList`

### 4. `index.js` (Exports)
- Exports all team-related components

## Navigation Flow:
1. **Team List** → Click member → **User Details**
2. **User Details** → Back button → **Team List**

## Routes to Add:
```jsx
// In your router configuration
import { TeamList, UserDetails } from './pages/team';

<Route path="/team" element={<TeamList />} />
<Route path="/team/member/:userId" element={<UserDetails />} />
```

## API Endpoints Used:
- `/auth/teams` - Fetch all team members
- `/realtleads/userbasedlead?name={userName}` - User specific leads (✅ IMPLEMENTED)
- `/inventry/userbasedinventry?transferTo={userName}` - User specific inventory (✅ IMPLEMENTED)

### API Implementation Details:
- **Base URL**: `https://backend.realtyxpo.in/api`
- **Authentication**: Bearer token from localStorage
- **Headers**: Content-Type: application/json
- **Error Handling**: 401 (auth), 404 (not found), general errors
- **Response Processing**: Handles multiple response structures

### API Testing:
Use the `APITester` component to test all endpoints:
```jsx
import { APITester } from './pages/team';
// Add <APITester /> to your component for debugging
```

## Toggle Switch Options:
### Primary:
- Leads, Inventory, Daily Plan, Info

### Secondary (Conditional):
- **Leads**: All Buyers, Rental Business, Completed Leads
- **Inventory**: Sale, Rent, Completed Inventory
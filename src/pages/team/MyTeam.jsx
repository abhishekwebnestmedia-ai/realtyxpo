import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from "react";
import {
  Users,
  Loader2,
  ArrowLeft,
  BriefcaseBusiness,
  Building,
  NotepadTextDashedIcon,
  Info,
} from "lucide-react";
import api from "../../api/api";
// token now stored in localStorage
import { toast } from "react-hot-toast";
import ToggleSwitch from "../../components/ui/ToggleSwitch";
import { SmallSwitch } from "../../components/ui";
import { ScrollableLeads } from "../../components/dashboard";
import UserDailyPlanTable from "../../components/dashboard/UserDailyPlanTable";
import ViewProfile from "../profile/ViewProfile";
import { AuthContext } from "../../context/AuthContext";
import {
  getViewerPerms,
  hasAnyLeadAccess,
  hasAnyInventoryAccess,
} from "../../utils/permissions";
import { useModal } from '../../context/ModalContext';

const MyTeam = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentView, setCurrentView] = useState("team");
  const [primaryOption, setPrimaryOption] = useState("Leads");
  const [secondaryOption, setSecondaryOption] = useState("All Buyers");
  const [userData, setUserData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const { showConfirm } = useModal();
  // helper to resolve user id from various shapes
  // Priority: _id (from /auth/teams API) > id > userId > uid > nested user._id > nested user.id
  const resolveUserId = (u) =>
    u?._id || u?.id || u?.userId || u?.uid || u?.user?._id || u?.user?.id || null;

  // centralized delete handler for team members
  const handleDeleteUser = async (member) => {
    if (!member) return;
    const userId = resolveUserId(member);
    
  // (no debug logging)
    
    if (!userId) {
      toast.error('Cannot delete: user id missing.');
      return;
    }

    const confirmed = await showConfirm(
      `Are you sure you want to permanently delete ${member.name || member.username || 'this user'}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingUserId(userId);
    setDataLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  // Backend delete endpoint — use auth namespace
  const url = `/auth/delete/${encodeURIComponent(userId)}`;

  const res = await api.delete(url, { headers });
      toast.success(res.data?.message || 'User deleted successfully');
      
  // Remove user from list using the same ID resolver we used for deletion
  setUsers((prev) => prev.filter((u) => resolveUserId(u) !== userId));
      setSelectedUser(null);
      setCurrentView('team');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Permission denied. You must be an admin to delete users.');
      } else if (err.response?.status === 404) {
        toast.error(`User not found. The backend returned 404 for ID: ${userId}`);
      } else {
        const serverMsg = err.response?.data?.message || err.response?.data || err.message;
        toast.error(String(serverMsg) || 'Failed to delete user');
      }
    } finally {
      setDeletingUserId(null);
      setDataLoading(false);
      try { fetchAllUsers(); } catch { /* ignore */ }
    }
  };
  // Auth context (moved up so callbacks can use it)
  const { user: authUser, fetchUserProfile } = useContext(AuthContext) || {};
  // local permissions state for the modal
  const [permissions, setPermissions] = useState({
    superAdmin: false,
    myTeam: false,
    learnGrow: false,
    brokers: false,
    dashboard: true,
    dailyPlans: false,
    findOpportunity: false,
    dataBase: false,
    leads_rental: false,
    leads_buyers: false,
    leads_dead: false,
    leads_completed: false,
    inv_rental: false,
    inv_sale: false,
    inv_completed: false,
    projectsWorking: false,
  });

  // NOTE: effects that call functions declared below are added after those functions

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/auth/teams");
      let usersData = [];
      if (response.data?.users && Array.isArray(response.data.users))
        usersData = response.data.users;
      else if (Array.isArray(response.data)) usersData = response.data;
      else if (response.data?.data && Array.isArray(response.data.data))
        usersData = response.data.data;
      
      // (removed debug logs) first user can be inspected in network tab if needed
      
      setUsers(usersData);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        toast.error("Authentication failed. Please login again.");
      } else {
        setError(err.response?.data?.message || "Failed to fetch users");
        toast.error("Failed to load team members");
      }
    } finally {
      setLoading(false);
    }
  };

  // call fetchAllUsers on mount (declared after function to avoid TDZ)
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchUserData = useCallback(async () => {
    if (!selectedUser) return;
    setDataLoading(true);
    try {
      const userName = selectedUser.name || selectedUser.username || "";
      let response;
      if (primaryOption === "Leads") {
        // Leads endpoint uses `name` query param and requires Authorization
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        response = await api.get('/realtleads/userbasedlead', { params: { name: userName }, headers });
  try { /* raw leads response logged removed for production */ } catch { /* ignore */ }
      } else if (primaryOption === "Inventory") {
        // Inventory endpoint expects lowercase transferTo and relies on cookies (withCredentials)
    response = await api.get('/inventry/userbasedinventry', { params: { transferTo: userName } });
  try { /* raw inventory response log removed */ } catch { /* ignore */ }
      }
      else {
        setUserData([]);
        setDataLoading(false);
        return;
      }

      let data = [];
      if (response.data?.leads && Array.isArray(response.data.leads))
        data = response.data.leads;
      else if (
        response.data?.inventories &&
        Array.isArray(response.data.inventories)
      )
        data = response.data.inventories;
      else if (Array.isArray(response.data)) data = response.data;
      else if (response.data?.data && Array.isArray(response.data.data))
        data = response.data.data;

      // inline filtering logic (previously in filterDataBySecondaryOption)
      let filtered = data;

      // Narrow by the selected secondary option
      if (primaryOption === "Leads") {
        switch (secondaryOption) {
          case "All Buyers":
            filtered = data.filter((item) => item.leadType === "Buyer");
            break;
          case "Rental Business":
            filtered = data.filter((item) => item.leadType === "Rental");
            break;
          case "Completed Leads":
            filtered = data.filter(
              (item) => item.status === "completed" || item.status === "closed"
            );
            break;
          default:
            filtered = data;
            break;
        }
      } else if (primaryOption === "Inventory") {
        switch (secondaryOption) {
          case "Sale":
            filtered = data.filter((item) => {
              const kind = String(item.type || item.category || item.inventoryType || item.inventory_type || '').toLowerCase();
              return kind.includes('sale') || kind.includes('sales');
            });
            break;
          case "Rent":
            filtered = data.filter((item) => {
              const kind = String(item.type || item.category || item.inventoryType || item.inventory_type || '').toLowerCase();
              return kind.includes('rent');
            });
            break;
          case "Completed Inventory":
            filtered = data.filter(
              (item) => String(item.status || '').toLowerCase() === 'completed' || String(item.status || '').toLowerCase() === 'sold'
            );
            break;
          default:
            filtered = data;
            break;
        }
      }

      // Further restrict results based on the logged-in user's permissions
      // normalize viewer permissions so we can check known keys reliably
      const viewerPerms = getViewerPerms(authUser || (authUser && authUser.permissions ? authUser.permissions : {}));
      const allowLeadItem = (item) => {
        // allow if viewer has allLeads permission
        if (viewerPerms.allLeads) return true;
        // also allow if superAdmin (can see everything including dead leads)
        if (viewerPerms.superAdmin) return true;
        
        const type = String(item.leadType || item.type || '').toLowerCase();
        const status = String(item.status || '').toLowerCase();
        
        // Dead leads: only visible to super admins
        if (status.includes('dead') || status === 'dead lead') {
          return false; // Already checked superAdmin above
        }
        
        // Completed leads
        if (status === 'completed' || status === 'closed') {
          return !!viewerPerms.completedLeads;
        }
        
        // Rental leads
        if (type.includes('rental') || type === 'rental') {
          return !!viewerPerms.rentalLeads;
        }
        
        // Buyer leads
        if (type.includes('buyer') || type === 'buyer') {
          return !!viewerPerms.buyerLeads;
        }
        
        // Unknown type: allow if user has any lead permission
        return !!(viewerPerms.rentalLeads || viewerPerms.buyerLeads || viewerPerms.completedLeads);
      };

      const allowInventoryItem = (item) => {
        if (viewerPerms.inventory) return true;
        // derive the item's type from multiple possible fields
        const kind = String(item.inventoryType || item.type || item.category || item.inventory_type || '').toLowerCase();
        const status = String(item.status || '').toLowerCase();
        
        // Check if item is rental
        if (kind.includes('rent')) {
          return !!viewerPerms.rentalInventory;
        }
        // Check if item is sale
        if (kind.includes('sale') || kind.includes('sell')) {
          return !!viewerPerms.saleInventory;
        }
        // Check if item is completed
        if (status === 'completed' || status === 'sold' || status === 'rented') {
          return !!viewerPerms.completedInventory;
        }
        // Unknown type: deny by default for safety
        return false;
      };

      if (primaryOption === "Leads") filtered = filtered.filter(allowLeadItem);
      else if (primaryOption === "Inventory")
        filtered = filtered.filter(allowInventoryItem);

  try { /* filtered data log removed */ } catch { /* ignore */ }
      setUserData(filtered);
    } catch (err) {
      if (err.response?.status === 401)
        toast.error("Authentication failed. Please login again.");
      else if (err.response?.status === 404)
        toast.error(`No ${primaryOption.toLowerCase()} found for this user`);
      else
        toast.error(
          `Failed to load ${primaryOption.toLowerCase()}: ${
            err.response?.data?.message || err.message
          }`
        );
      setUserData([]);
    } finally {
      setDataLoading(false);
    }
  }, [selectedUser, primaryOption, secondaryOption, authUser]);

  // fetchUserData is memoized; call it when selected user or view changes
  useEffect(() => {
    if (selectedUser && currentView === "details") fetchUserData();
  }, [fetchUserData, currentView, selectedUser]);

  // filtering moved inside fetchUserData to avoid stale/memoization issues

  const handleUserClick = (u) => {
    // selected user set; avoid logging to keep console clean
    setSelectedUser(u);
    setCurrentView("details");
    setPrimaryOption("Leads");
    setSecondaryOption("All Buyers");
    setUserData([]);
    setCurrentPage(1); // Reset pagination when switching users
  };
  const handleBackToTeam = () => {
    setCurrentView("team");
    setSelectedUser(null);
    setUserData([]);
  };

  const openPermissionsModal = () => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }

    // Fetch permissions using the dedicated permissions API as requested
    const userId = selectedUser._id || selectedUser.id;
    if (userId) {
      (async () => {
        setPermissionsLoading(true);
        try {
          // Use only the query form as requested
          const res = await api.get(`/auth/permissions?userId=${userId}`);

          const permsResponse = res.data?.data || res.data;
          const p = permsResponse?.permissions || permsResponse || {};

          setPermissions({
            superAdmin: !!p.superAdmin,
            myTeam: !!p.myTeam,
            learnGrow: !!p.learnGrow,
            brokers: !!p.brokersRequirements || !!p.brokers,
            dashboard: !!p.dashboard,
            dailyPlans: !!p.dailyPlans,
            findOpportunity: !!p.findOpportunity,
            dataBase: !!p.dataBase,
            projectsWorking: !!p.projectsWorking || !!p.projects_working,
            leads_rental:
              !!p.rentalLeads || !!p.rental_leads || !!p.rentalLeads,
            leads_buyers: !!p.buyerLeads || !!p.buyer_leads || !!p.buyerLeads,
            leads_dead: !!p.deadLeads || !!p.dead_leads || !!p.deadLeads,
            leads_completed:
              !!p.completedLeads || !!p.completed_leads || !!p.completedLeads,
            inv_rental:
              !!p.rentalInventory ||
              !!p.rental_inventory ||
              !!p.rentalInventory,
            inv_sale:
              !!p.saleInventory || !!p.sale_inventory || !!p.saleInventory,
            inv_completed:
              !!p.completedInventory ||
              !!p.completed_inventory ||
              !!p.completedInventory,
          });
  } catch {
          // Fallback to whatever we have locally if server fetch fails
          const p = selectedUser.permissions || selectedUser || {};
          setPermissions({
            superAdmin: !!p.superAdmin,
            myTeam: !!p.myTeam,
            learnGrow: !!p.learnGrow,
            brokers: !!p.brokersRequirements || !!p.brokers,
            dashboard: !!p.dashboard,
            dailyPlans: !!p.dailyPlans,
            findOpportunity: !!p.findOpportunity,
            dataBase: !!p.dataBase,
            projectsWorking: !!p.projectsWorking || !!p.projects_working,
            leads_rental: !!p.rentalLeads,
            leads_buyers: !!p.buyerLeads,
            leads_dead: !!p.deadLeads,
            leads_completed: !!p.completedLeads,
            inv_rental: !!p.rentalInventory,
            inv_sale: !!p.saleInventory,
            inv_completed: !!p.completedInventory,
          });
        } finally {
          setPermissionsLoading(false);
          setPermissionsOpen(true);
        }
      })();
    } else {
      const p = selectedUser.permissions || selectedUser || {};
      setPermissions({
        superAdmin: !!p.superAdmin,
        myTeam: !!p.myTeam,
        learnGrow: !!p.learnGrow,
        brokers: !!p.brokersRequirements || !!p.brokers,
        dashboard: !!p.dashboard,
        dailyPlans: !!p.dailyPlans,
        findOpportunity: !!p.findOpportunity,
        dataBase: !!p.dataBase,
        projectsWorking: !!p.projectsWorking || !!p.projects_working,
        leads_rental: !!p.rentalLeads,
        leads_buyers: !!p.buyerLeads,
        leads_dead: !!p.deadLeads,
        leads_completed: !!p.completedLeads,
        inv_rental: !!p.rentalInventory,
        inv_sale: !!p.saleInventory,
        inv_completed: !!p.completedInventory,
      });
      setPermissionsOpen(true);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    setSavingPermissions(true);
    try {
      const payload = {
        userId: selectedUser._id || selectedUser.id,
        permissions: {
          superAdmin: !!permissions.superAdmin,
          dashboard: !!permissions.dashboard,
          dailyPlans: !!permissions.dailyPlans,
          // allLeads should be explicit or true only if ALL sub-lead flags are enabled
          allLeads: !!(
            permissions.allLeads ??
            (permissions.leads_buyers &&
              permissions.leads_rental &&
              permissions.leads_dead &&
              permissions.leads_completed)
          ),
          // inventory should be explicit or true only if ALL sub-inventory flags are enabled
          inventory: !!(
            permissions.inventory ??
            (permissions.inv_rental &&
              permissions.inv_sale &&
              permissions.inv_completed)
          ),
          projectsWorking: !!permissions.projectsWorking,
          brokersRequirements: !!permissions.brokers,
          myTeam: !!permissions.myTeam,
          findOpportunity: !!permissions.findOpportunity,
          learnGrow: !!permissions.learnGrow,
          dataBase: !!permissions.dataBase,
          rentalLeads: !!permissions.leads_rental,
          buyerLeads: !!permissions.leads_buyers,
          deadLeads: !!permissions.leads_dead,
          completedLeads: !!permissions.leads_completed,
          rentalInventory: !!permissions.inv_rental,
          saleInventory: !!permissions.inv_sale,
          completedInventory: !!permissions.inv_completed,
        },
      };

      const res = await api.put("/auth/permissions", payload);
      toast.success(res.data?.message || "Permissions updated");
      if (res.data?.data) {
        const returned = res.data.data;
        setPermissions((prev) => ({
          ...prev,
          superAdmin: !!returned.superAdmin,
          myTeam: !!returned.myTeam,
          learnGrow: !!returned.learnGrow,
          brokers: !!returned.brokersRequirements,
          dashboard: !!returned.dashboard,
          dailyPlans: !!returned.dailyPlans,
          findOpportunity: !!returned.findOpportunity,
          dataBase: !!returned.dataBase,
          projectsWorking: !!returned.projectsWorking || !!returned.projects_working,
          leads_rental: !!returned.rentalLeads,
          leads_buyers: !!returned.buyerLeads,
          leads_dead: !!returned.deadLeads,
          leads_completed: !!returned.completedLeads,
          inv_rental: !!returned.rentalInventory,
          inv_sale: !!returned.saleInventory,
          inv_completed: !!returned.completedInventory,
        }));

        setUsers((prev) =>
          prev.map((u) =>
            u._id === selectedUser._id ? { ...u, permissions: returned } : u
          )
        );
        setSelectedUser((s) => ({ ...s, permissions: returned }));

        // If the changed permissions belong to the current user, refresh the auth profile so the app updates immediately
        try {
          const updatedId = returned._id || returned.id || payload.userId;
          const currentId = authUser?._id || authUser?.id;
          if (
            currentId &&
            updatedId &&
            String(currentId) === String(updatedId) &&
            typeof fetchUserProfile === "function"
          ) {
            await fetchUserProfile();
          }
        } catch {
          // suppressed console warning
        }
      }
      setPermissionsOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update permissions"
      );
    } finally {
      setSavingPermissions(false);
    }
  };
  const getSecondaryOptions = () => {
    if (primaryOption === "Leads")
      return [
        { value: "All Buyers", label: "All Buyers" },
        { value: "Rental Business", label: "Rental Business" },
        { value: "Completed Leads", label: "Completed Leads" },
      ];
    if (primaryOption === "Inventory")
      return [
        { value: "Sale", label: "Sale" },
        { value: "Rent", label: "Rent" },
        { value: "Completed Inventory", label: "Completed Inventory" },
      ];
    return [];
  };
  const handlePrimaryOptionChange = (option) => {
    setPrimaryOption(option);
    setCurrentPage(1); // Reset pagination when changing options
    if (option === "Leads") setSecondaryOption("All Buyers");
    else if (option === "Inventory") setSecondaryOption("Sale");
    else setSecondaryOption("");
  };
  const primaryOptions = useMemo(() => {
    const vp = getViewerPerms(authUser || {});
    const hasLeads = hasAnyLeadAccess(vp);
    const hasInventory = hasAnyInventoryAccess(vp);
    const hasDaily = Boolean(vp.dailyPlans);

    const opts = [];
    if (hasLeads)
      opts.push({ value: "Leads", label: "Leads", icon: BriefcaseBusiness });
    if (hasInventory)
      opts.push({ value: "Inventory", label: "Inventory", icon: Building });
    if (hasDaily)
      opts.push({
        value: "Daily Plan",
        label: "Daily Plan",
        icon: NotepadTextDashedIcon,
      });
    // Always include Info so profile can be viewed
    opts.push({ value: "Info", label: "Info", icon: Info });

    // Fallback: if nothing else available, include Info so UI has something to show
    if (opts.length === 0)
      return [{ value: "Info", label: "Info", icon: Info }];
    return opts;
  }, [authUser]);

  // ensure selected primaryOption is allowed; if not, pick the first available
  useEffect(() => {
    if (!primaryOptions || primaryOptions.length === 0) return;
    const allowedValues = primaryOptions.map((o) => o.value);
    if (!allowedValues.includes(primaryOption)) {
      setPrimaryOption(primaryOptions[0].value);
      // also reset secondary option when primary changes
      if (primaryOptions[0].value === "Leads") setSecondaryOption("All Buyers");
      else if (primaryOptions[0].value === "Inventory")
        setSecondaryOption("Sale");
      else setSecondaryOption("");
    }
  }, [primaryOptions, primaryOption]);
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Build full image URL for relative paths returned by the API
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://backend.realtyxpo.in${imagePath}`;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Team Members
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch your team...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Users className="h-16 w-16 text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            Error Loading Team
          </h3>
          <p className="text-gray-500 max-w-md mb-4">{error}</p>
          <button
            onClick={fetchAllUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  if (users.length === 0)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            No Team Members Found
          </h3>
          <p className="text-gray-500 max-w-md">
            There are no team members to display at the moment.
          </p>
        </div>
      </div>
    );

  if (currentView === "team")
    return (
      <div>
        <h1 className="text-2xl font-medium text-gray-900 mb-4">My Team</h1>
        <div className="flex flex-wrap">
          {users.map((u) => {
            const profileSrc = getImageUrl(
              u.profileImage || u.profilePicture || u.avatar || u.profilePhoto
            );
            return (
              <div
                key={u._id || u.id}
                className="p-4 cursor-pointer"
                onClick={() => handleUserClick(u)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {profileSrc ? (
                      <img
                        src={profileSrc}
                        alt={u.name || "Profile"}
                        className="w-[6.5rem] h-[6.5rem] rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-[6.5rem] h-[6.5rem] rounded-full bg-gray-600 flex items-center justify-center text-white text-2xl font-semibold">
                        {getInitials(u.name || u.username || u.email)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {u.name || u.username || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {u.designation || u.role || "Team Member"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBackToTeam}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Team
        </button>
        <button
          type="button"
          className="btn px-4 py-2"
          onClick={openPermissionsModal}
          disabled={permissionsLoading}
        >
          {permissionsLoading ? "Loading..." : "Permissions"}
        </button>
      </div>

      <div className="mb-6">
        <div className="max-w-md">
          <ToggleSwitch
            value={primaryOption}
            options={primaryOptions}
            onChange={handlePrimaryOptionChange}
            size="md"
          />
        </div>
        {(primaryOption === "Leads" || primaryOption === "Inventory") && (
          <div className="max-w-lg mt-4">
            <ToggleSwitch
              value={secondaryOption}
              options={getSecondaryOptions()}
              onChange={setSecondaryOption}
              size="md"
            />
          </div>
        )}
      </div>

      <div>
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
            <span>Loading {primaryOption.toLowerCase()}...</span>
          </div>
        ) : primaryOption === "Info" ? (
          // Show profile with admin-only delete control when applicable
          <ViewProfile
            profileUser={selectedUser}
            customHeading={`${selectedUser?.name || "User"} Profile`}
            showEditButton={false}
            // enable delete button only for super admins
            showDeleteButton={(() => {
              try {
                const vp = getViewerPerms(authUser || {});
                return !!vp?.superAdmin;
              } catch {
                return false;
              }
            })()}
            onDelete={() => handleDeleteUser(selectedUser)}
            // pass deleting flag (disabled state) based on deletingUserId
            deleting={deletingUserId === resolveUserId(selectedUser)}
          />
        ) : primaryOption === "Leads" ? (
          <div className="max-h-96">
            <ScrollableLeads
              data={userData}
              hideSearch
              externalSearch=""
              externalRowsPerPage={5}
            />
          </div>
        ) : primaryOption === "Daily Plan" ? (
          <UserDailyPlanTable
            userName={selectedUser?.name || selectedUser?.username || ""}
          />
        ) : primaryOption === "Inventory" ? (
          <div className="overflow-y-auto">
            {userData.length > 0 ? (
              <>
                <div className="overflow-x-auto bg-white rounded-tr-3xl rounded-tl-3xl">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10 font-bold">
                      <tr>
                        <th className="px-4 py-2 font-semibold text-center theading">S.No</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Seller Name</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Project</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Sector No</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Unit No</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Tower No</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Typology</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Size</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Demand</th>
                        <th className="px-4 py-2 whitespace-nowrap theading font-semibold">Contact No.</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Email</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Payment Status</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Registry Type</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Requirement</th>
                        <th className="px-4 py-6 whitespace-nowrap theading text-left font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((item, idx) => (
                        <tr key={item._id || idx} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.sellerName || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {Array.isArray(item.Project) ? item.Project.join(', ') : (item.Project || 'N/A')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.sector || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.unitNo || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.towerNo || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {Array.isArray(item.typology) ? item.typology.join(', ') : (item.typology || 'N/A')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.size || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.demand || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap flex flex-wrap gap-1">
                            {Array.isArray(item.contactNumbers) && item.contactNumbers.length > 0 ? 
                              item.contactNumbers.map((num, idx) => (
                                <span key={idx} className="text-[#020E4F] px-2 rounded-full text-sm">
                                  {num}
                                </span>
                              )) : 'N/A'
                            }
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.email || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {Array.isArray(item.paymentStatus) ? item.paymentStatus.join(', ') : (item.paymentStatus || 'N/A')}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.registryType || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.requirement || 'N/A'}</td>
                          <td className="px-4 py-4 whitespace-nowrap">{item.date || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {userData.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div className="flex justify-between flex-1 sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(userData.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(userData.length / itemsPerPage)}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, userData.length)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{userData.length}</span>
                          {' '}results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: Math.ceil(userData.length / itemsPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                              const totalPages = Math.ceil(userData.length / itemsPerPage);
                              if (totalPages <= 7) return true;
                              if (page === 1 || page === totalPages) return true;
                              if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                              return false;
                            })
                            .map((page, index, array) => (
                              <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    ...
                                  </span>
                                )}
                                <button
                                  onClick={() => setCurrentPage(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === page
                                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))}
                          
                          <button
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(userData.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(userData.length / itemsPerPage)}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No inventory data found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {primaryOption} data will be available soon
            </p>
          </div>
        )}
      </div>

      {permissionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setPermissionsOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-lg w-[36rem] max-w-full p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Permissions</h3>
              <button
                onClick={() => setPermissionsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm text-gray-700 justify-evenly">
              <div className="space-y-3">
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">Super Admin</div>
                  <SmallSwitch
                    checked={permissions.superAdmin}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, superAdmin: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">My Team</div>
                  <SmallSwitch
                    checked={permissions.myTeam}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, myTeam: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">Learn & Grow</div>
                  <SmallSwitch
                    checked={permissions.learnGrow}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, learnGrow: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">
                    Brokers Requirements
                  </div>
                  <SmallSwitch
                    checked={permissions.brokers}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, brokers: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">Projects Working</div>
                  <SmallSwitch
                    checked={permissions.projectsWorking}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, projectsWorking: v }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">Dashboard</div>
                  <SmallSwitch
                    checked={permissions.dashboard}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, dashboard: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">Daily Plans</div>
                  <SmallSwitch
                    checked={permissions.dailyPlans}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, dailyPlans: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">Find Opportunity</div>
                  <SmallSwitch
                    checked={permissions.findOpportunity}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, findOpportunity: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <div className="text-base font-medium">Data Base</div>
                  <SmallSwitch
                    checked={permissions.dataBase}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, dataBase: v }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Leads</h4>
              <div className="flex gap-4 text-sm text-gray-700 justify-between">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-base">Rental</span>
                  <SmallSwitch
                    checked={permissions.leads_rental}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, leads_rental: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-base">Buyers</span>
                  <SmallSwitch
                    checked={permissions.leads_buyers}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, leads_buyers: v }))
                    }
                  />
                </div>
                {/* Dead Leads are admin-only and controlled by superAdmin flag; remove individual switch to avoid confusion */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-base">Completed Leads</span>
                  <SmallSwitch
                    checked={permissions.leads_completed}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, leads_completed: v }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Inventory</h4>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 items-start justify-between">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-base">Rental</span>
                  <SmallSwitch
                    checked={permissions.inv_rental}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, inv_rental: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-base">Sale</span>
                  <SmallSwitch
                    checked={permissions.inv_sale}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, inv_sale: v }))
                    }
                  />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="text-base">Completed</span>
                  <SmallSwitch
                    checked={permissions.inv_completed}
                    onChange={(v) =>
                      setPermissions((p) => ({ ...p, inv_completed: v }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPermissionsOpen(false)}
                className="px-4 py-2 border border-red-300 text-red-500 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={savingPermissions}
                className="btn px-4 py-2 bg-blue-600 text-white rounded"
              >
                {savingPermissions ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTeam;

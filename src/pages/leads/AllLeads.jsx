// // src/pages/leads/AllLeads.jsx
// import React, { useState, useMemo, useContext } from "react";
// import { useLeads } from "../../hooks/useLeads";
// import { ScrollableLeads } from "../../components/dashboard";

// import { useNavigate } from "react-router-dom";
// import { AddBulkLead } from "../../components/modals";
// import { AuthContext } from '../../context/AuthContext';
// import { getViewerPerms, canViewLead } from '../../utils/permissions';
// import { exportRowsAsPdf } from '../../utils/exportPdf';
// import TokenSearch from '../../components/ui/TokenSearch';

// const AllLeads = () => {
//   const navigate = useNavigate();
//   const { data: leadsRaw, isLoading, error } = useLeads();
//   // console.log("Leads fetched:", leadsRaw);
//   // Normalize possible response shapes
//   const leads = useMemo(() => {
//     if (Array.isArray(leadsRaw)) return leadsRaw;
//     if (leadsRaw && Array.isArray(leadsRaw.data)) return leadsRaw.data;
//     return [];
//   }, [leadsRaw]);

//   const [filter, setFilter] = useState("buyers");
//   const [showBulkUploadPopup, setShowBulkUploadPopup] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   // tokens when parent wants to control search tokens (used when table hides its own search)
//   const [externalTokens, setExternalTokens] = useState([]);
//   const [currentPageRows, setCurrentPageRows] = useState([]);
  
//   // table-specific filters removed — using page-level filteredLeads only

//   const isDead = (lead) =>
//     typeof lead?.status === "string" && /dead/i.test(lead.status);

//   const { user: authUser } = useContext(AuthContext) || {};

//   const filteredLeads = useMemo(() => {
//     const viewerPerms = getViewerPerms(authUser || {});
//     if (!Array.isArray(leads)) return [];

//     // First filter by permission per item
//     const permissionFiltered = leads.filter((item) => canViewLead(viewerPerms, item));

//     if (filter === "buyers") return permissionFiltered.filter((l) => String(l?.leadType).toLowerCase().includes('buyer') && !isDead(l));
//     if (filter === "rental") return permissionFiltered.filter((l) => String(l?.leadType).toLowerCase().includes('rental') || String(l?.leadType).toLowerCase().includes('rent'));
//     if (filter === "dead") return permissionFiltered.filter((l) => isDead(l));

//     return permissionFiltered.filter((l) => !isDead(l));
//   }, [leads, filter, authUser]);

//   const filteredAndTableFilteredLeads = filteredLeads;

//   // derive viewer permissions and admin flag for UI gating/reactive resets
//   const viewerPerms = getViewerPerms(authUser || {});
//   const isAdmin = Boolean(viewerPerms?.superAdmin);

//   // If the current filter is 'dead' but the viewer is not allowed to see dead leads,
//   // reset back to buyers so they don't stay stuck on an inaccessible view.
//   React.useEffect(() => {
//     if (filter === 'dead' && !isAdmin) {
//       setFilter('buyers');
//     }
//   }, [filter, isAdmin]);

//   // removed dev debug logging

//   if (isLoading) return <p className="p-4">Loading leads...</p>;
//   if (error) return <p className="p-4 text-red-500">Error loading leads</p>;

//   // Helper for background slide position


//   return (
//     <div className="p-1">
//       <div className="flex flex-row justify-between">
//         <h2 className="pageheading">All Leads</h2>
//         <div className="flex gap-4">
//           <button 
//             className="btn" 
//             onClick={() => setShowBulkUploadPopup(true)}
//           >
//             Add Bulk Lead
//           </button>
//           <button
//             className="btn"
//             onClick={() => navigate("/all-leads/addLead")}
//           >
//             Add Lead
//           </button>
//         </div>
//       </div>

//       {/* Toggle Switch with Search and Controls */}
//       <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-4">
//         <div className="w-full lg:w-1/2 flex items-center">
//           {/* Toggle Switch (left) */}
//           <div className="relative flex w-full items-center bg-white rounded-full p-1 overflow-hidden border border-gray-200 h-10">
//           {/* Highlight */}
//           <div
//             className="absolute left-[2px] w-[calc(33.333%-6px)] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
//             style={{
//               top: 2,
//               bottom: 2,
//               transform:
//                 filter === "buyers"
//                   ? "translateX(0px)"
//                   : filter === "rental"
//                   ? "translateX(calc(100% + 6px))"
//                   : "translateX(calc(200% + 12px))",
//             }}
//           />

//           {/* Buyers */}
//           <button
//             onClick={() => setFilter("buyers")}
//             className={`relative flex-1 h-full flex items-center justify-center px-3 text-sm font-medium transition-colors z-10 whitespace-nowrap ${
//               filter === "buyers" ? "text-white" : "text-gray-700"
//             }`}
//           >
//             <span className="relative z-10">All Buyers</span>
//           </button>

//           {/* Rental */}
//           <button
//             onClick={() => setFilter("rental")}
//             className={`relative flex-1 h-full flex items-center justify-center px-3 text-sm font-medium transition-colors z-10 whitespace-nowrap ${
//               filter === "rental" ? "text-white" : "text-gray-700"
//             }`}
//           >
//             <span className="relative z-10">Rental Business</span>
//           </button>

//           {/* Dead - only visible to super admins */}
//           {Boolean(authUser?.permissions?.superAdmin) && (
//             <button
//               onClick={() => setFilter("dead")}
//               className={`relative flex-1 h-full flex items-center justify-center px-3 text-sm font-medium transition-colors z-10 whitespace-nowrap ${
//                 filter === "dead" ? "text-white" : "text-gray-700"
//               }`}
//             >
//               <span className="relative z-10">Dead Leads</span>
//             </button>
//           )}
//           </div>
//         </div>

//         {/* Search and Controls (right) */}
//         <div className="w-full lg:w-1/2 flex items-center justify-end">
//           <div className="flex flex-col sm:flex-row gap-3 items-center">
//           <div>
//             <TokenSearch
//               value={searchTerm}
//               onChange={setSearchTerm}
//               tokens={externalTokens}
//               onTokensChange={setExternalTokens}
//             />
//           </div>
//           <button
//             className="btn ml-2"
//             onClick={() => {
//               // build columns and rows from filteredAndTableFilteredLeads
//               const columns = [
//                 { key: 'customerName', label: 'Customer' },
//                 { key: 'contactNumber', label: 'Contact' },
//                 { key: 'email', label: 'Email' },
//                 { key: 'status', label: 'Status' },
//                 { key: 'followUp', label: 'Follow Up' },
//                 { key: 'requirement', label: 'Requirement' },
//                 { key: 'date', label: 'Date' }
//               ];
//               const rows = (currentPageRows && currentPageRows.length ? currentPageRows : filteredAndTableFilteredLeads || []).map(r => ({
//                 customerName: r.customerName || r.name || r.customer || '',
//                 contactNumber: r.contactNumber || r.contactNo || '',
//                 email: r.email || '',
//                 status: r.status || '',
//                 followUp: r.followUp || r.followUpDate || '',
//                 requirement: r.requirement || r.remark || '',
//                 date: r.date || ''
//               }));
//               exportRowsAsPdf({ columns, rows, fileName: 'leads.pdf', title: 'Leads Export' });
//             }}
//           >
//             Export all
//           </button>
//             {/* rows-per-page control removed; table now shows inline entries select in pagination */}
//           </div>
//         </div>
//       </div>

//       {/* Table-specific filters removed */}

//       <ScrollableLeads 
//         data={filteredAndTableFilteredLeads} 
//         hideSearch={true}
//         externalSearch={searchTerm}
//         externalTokens={externalTokens}
//         onExternalTokensChange={setExternalTokens}
//         onPageRowsChange={(rows) => setCurrentPageRows(rows)}
//       />

//       {/* Bulk Upload Popup */}
//       <AddBulkLead 
//         isOpen={showBulkUploadPopup} 
//         onClose={() => setShowBulkUploadPopup(false)} 
//       />
//     </div>
//   );
// };

// export default AllLeads;








import React, { useState, useMemo, useContext } from "react";
import { useLeads } from "../../hooks/useLeads";
import { ScrollableLeads } from "../../components/dashboard";
import { useNavigate } from "react-router-dom";
import { AddBulkLead } from "../../components/modals";
import { AuthContext } from "../../context/AuthContext";
import { getViewerPerms, canViewLead } from "../../utils/permissions";
import ExportModal from "../../components/ui/ExportModal";
import TokenSearch from "../../components/ui/TokenSearch";
import { ToggleSwitch } from "../../components/ui";
import { FilePlus2, Plus } from 'lucide-react';

const AllLeads = () => {
  const navigate = useNavigate();
  const { data: leadsRaw, isLoading, error } = useLeads();

  const leads = useMemo(() => {
    if (Array.isArray(leadsRaw)) return leadsRaw;
    if (leadsRaw && Array.isArray(leadsRaw.data)) return leadsRaw.data;
    return [];
  }, [leadsRaw]);

  const [filter, setFilter] = useState("buyers");
  const [showBulkUploadPopup, setShowBulkUploadPopup] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [externalTokens, setExternalTokens] = useState([]);

  const { user: authUser } = useContext(AuthContext) || {};
  const viewerPerms = getViewerPerms(authUser || {});
  const isAdmin = Boolean(viewerPerms?.superAdmin);
  const userId = authUser?._id || authUser?.id || authUser?.userId || authUser?.uid || null;
  const normalizedUserId = userId ? String(userId) : null;

  const hasExplicitLeadPerms = useMemo(() => {
    return Boolean(
      viewerPerms?.allLeads ||
        viewerPerms?.buyerLeads ||
        viewerPerms?.rentalLeads ||
        viewerPerms?.deadLeads ||
        viewerPerms?.completedLeads ||
        viewerPerms?.superAdmin
    );
  }, [viewerPerms]);

  const isDead = (lead) =>
    typeof lead?.status === "string" && /dead/i.test(lead.status);

  // compute base visibility respecting permissions but falling back to assignments/defaults
  const permissionAwareLeads = useMemo(() => {
    if (!Array.isArray(leads)) return [];

    return leads.filter((item) => {
      if (canViewLead(viewerPerms, item)) return true;

      if (!hasExplicitLeadPerms) return true;

      if (normalizedUserId) {
        const assigned = item?.assignTo;
        const assignedId =
          typeof assigned === "object"
            ? assigned?._id || assigned?.id || assigned?.userId
            : assigned;
        if (assignedId && String(assignedId) === normalizedUserId) {
          return true;
        }
      }

      return false;
    });
  }, [leads, viewerPerms, hasExplicitLeadPerms, normalizedUserId]);

  const classifyLead = (lead) => {
    const rawType = String(lead?.leadType || lead?.type || "").toLowerCase();
    const isRentalType = rawType.includes("rent");
    const isBuyerType = rawType.includes("buy") || (!isRentalType && rawType.length === 0);
    return { isRentalType, isBuyerType };
  };

  const toggleOptions = useMemo(() => {
    const base = [
      { value: "buyers", label: "All Buyers" },
      { value: "rental", label: "Rental Business" },
    ];
    if (isAdmin) base.push({ value: "dead", label: "Dead Leads" });
    return base;
  }, [isAdmin]);

  // ✅ Filter logic with graceful fallbacks
  const filteredLeads = useMemo(() => {
    if (!Array.isArray(permissionAwareLeads)) return [];

    if (filter === "buyers") {
      return permissionAwareLeads.filter((lead) => {
        if (isDead(lead)) return false;
        const { isRentalType, isBuyerType } = classifyLead(lead);
        if (isBuyerType) return true;
        return !isRentalType; // treat uncategorized leads as buyers by default
      });
    }

    if (filter === "rental") {
      return permissionAwareLeads.filter((lead) => classifyLead(lead).isRentalType);
    }

    if (filter === "dead") {
      return permissionAwareLeads.filter((lead) => isDead(lead));
    }

    return permissionAwareLeads.filter((lead) => !isDead(lead));
  }, [permissionAwareLeads, filter]);

  React.useEffect(() => {
    if (filter === "dead" && !isAdmin) {
      setFilter("buyers");
    }
  }, [filter, isAdmin]);

  if (isLoading) return <p className="p-4">Loading leads...</p>;
  if (error) return <p className="p-4 text-red-500">Error loading leads</p>;

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex flex-row justify-between">
        <h2 className="pageheading">All Leads</h2>
        <div className="flex gap-4">
          <button className="btn flex items-center gap-2" onClick={() => setShowBulkUploadPopup(true)}>
            <span>Add Bulk Lead</span>
            <FilePlus2 size={14} />
          </button>
          <button
            className="btn flex items-center gap-2"
            onClick={() => navigate("/all-leads/addLead")}
          >
            <span>Add Lead</span>
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Toggle + Search + Export */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-4">
        {/* Toggle Switch */}
        <div className="w-full lg:w-1/2 flex items-center">
          <ToggleSwitch
            value={filter}
            options={toggleOptions}
            onChange={setFilter}
            size="md"
            className="max-w-[36rem] w-auto"
          />
        </div>

        {/* Search & Export */}
        <div className="w-full lg:w-1/2 flex items-center justify-end">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <TokenSearch
              value={searchTerm}
              onChange={setSearchTerm}
              tokens={externalTokens}
              onTokensChange={setExternalTokens}
            />
            <button
              className="btn ml-2"
              onClick={() => setShowExportModal(true)}
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <ScrollableLeads
        data={filteredLeads}
        hideSearch={true}
        externalSearch={searchTerm}
        externalTokens={externalTokens}
        onExternalTokensChange={setExternalTokens}
      />

      {/* Popups */}
      <AddBulkLead
        isOpen={showBulkUploadPopup}
        onClose={() => setShowBulkUploadPopup(false)}
      />
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={filteredLeads}
        fileName="leads-export"
        title="Export Leads"
        showDateRange={true}
        dateField="date"
      />
    </div>
  );
};

export default AllLeads;

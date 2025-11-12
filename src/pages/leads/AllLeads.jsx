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
import dayjs from "dayjs";
import { useLeads } from "../../hooks/useLeads";
import { ScrollableLeads } from "../../components/dashboard";
import { useNavigate } from "react-router-dom";
import { AddBulkLead } from "../../components/modals";
import { AuthContext } from "../../context/AuthContext";
import { getViewerPerms, canViewLead } from "../../utils/permissions";
import { exportRowsAsPdf } from "../../utils/exportPdf";
import TokenSearch from "../../components/ui/TokenSearch";
import { FilePlus2, Plus } from 'lucide-react';

// ✅ Reusable Export Modal (select date range)
const ExportDateModal = ({ isOpen, onClose, onExport }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Export Leads by Date Range
        </h2>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onExport({ startDate, endDate });
              onClose();
            }}
            className="px-4 py-2 rounded bg-[#000D55] text-white hover:bg-[#001066]"
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const isDead = (lead) =>
    typeof lead?.status === "string" && /dead/i.test(lead.status);

  // ✅ Filter logic
  const filteredLeads = useMemo(() => {
    if (!Array.isArray(leads)) return [];

    const permissionFiltered = leads.filter((item) =>
      canViewLead(viewerPerms, item)
    );

    if (filter === "buyers")
      return permissionFiltered.filter(
        (l) =>
          String(l?.leadType).toLowerCase().includes("buyer") && !isDead(l)
      );
    if (filter === "rental")
      return permissionFiltered.filter(
        (l) =>
          String(l?.leadType).toLowerCase().includes("rental") ||
          String(l?.leadType).toLowerCase().includes("rent")
      );
    if (filter === "dead") return permissionFiltered.filter((l) => isDead(l));

    return permissionFiltered.filter((l) => !isDead(l));
  }, [leads, filter, viewerPerms]);

  React.useEffect(() => {
    if (filter === "dead" && !isAdmin) {
      setFilter("buyers");
    }
  }, [filter, isAdmin]);

  if (isLoading) return <p className="p-4">Loading leads...</p>;
  if (error) return <p className="p-4 text-red-500">Error loading leads</p>;

  // ✅ Export logic (uses only 7 columns)
  const handleExport = ({ startDate, endDate }) => {
    let sourceRows = filteredLeads || [];

    // Apply date range filtering
    if (startDate || endDate) {
      const start = startDate ? dayjs(startDate).startOf("day") : null;
      const end = endDate ? dayjs(endDate).endOf("day") : null;

      sourceRows = sourceRows.filter((row) => {
        if (!row.date) return false;
        const rowDate = dayjs(row.date);
        if (!rowDate.isValid()) return false;
        if (start && rowDate.isBefore(start)) return false;
        if (end && rowDate.isAfter(end)) return false;
        return true;
      });
    }

    // ✅ Only these columns
    const columns = [
      { key: "customerName", label: "Customer" },
      { key: "contactNumber", label: "Contact" },
      { key: "email", label: "Email" },
      { key: "status", label: "Status" },
      { key: "followUp", label: "Follow Up" },
      { key: "requirement", label: "Requirement" },
      { key: "date", label: "Date" },
    ];

    // ✅ Format the rows to match these columns
    const rows = sourceRows.map((r) => ({
      customerName: r.customerName || "",
      contactNumber: r.contactNumber || "",
      email: r.email || "",
      status: r.status || "",
      followUp: r.followUp
        ? dayjs(r.followUp).format("YYYY-MM-DD")
        : "",
      requirement: r.requirement || r.remark || "",
      date: r.date ? dayjs(r.date).format("YYYY-MM-DD") : "",
    }));

    exportRowsAsPdf({
      columns,
      rows,
      fileName: "leads.pdf",
      title: "Leads Export",
      // watermark: {
      //   src: "/watermark.svg",
      //   opacity: 0.06,
      //   scale: 0.5,
      //   raw: true,
      // },
    });
  };

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
          <div className="relative flex w-full items-center bg-white rounded-full p-1 overflow-hidden border border-gray-200 h-10">
            <div
              className="absolute left-[2px] w-[calc(33.333%-6px)] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
              style={{
                top: 2,
                bottom: 2,
                transform:
                  filter === "buyers"
                    ? "translateX(0px)"
                    : filter === "rental"
                    ? "translateX(calc(100% + 6px))"
                    : "translateX(calc(200% + 12px))",
              }}
            />

            <button
              onClick={() => setFilter("buyers")}
              className={`relative flex-1 h-full flex items-center justify-center px-3 text-sm font-medium transition-colors z-10 ${
                filter === "buyers" ? "text-white" : "text-gray-700"
              }`}
            >
              All Buyers
            </button>
            <button
              onClick={() => setFilter("rental")}
              className={`relative flex-1 h-full flex items-center justify-center px-3 text-sm font-medium transition-colors z-10 ${
                filter === "rental" ? "text-white" : "text-gray-700"
              }`}
            >
              Rental Business
            </button>
            {isAdmin && (
              <button
                onClick={() => setFilter("dead")}
                className={`relative flex-1 h-full flex items-center justify-center px-3 text-sm font-medium transition-colors z-10 ${
                  filter === "dead" ? "text-white" : "text-gray-700"
                }`}
              >
                Dead Leads
              </button>
            )}
          </div>
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
      <ExportDateModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default AllLeads;

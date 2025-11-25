// import React, { useState, useMemo, useContext } from "react";
// import TokenSearch from '../../components/ui/TokenSearch';
// import { useInventory } from "../../hooks/useInventory";
// import { InventoryTable } from "../../components/tables";
// import { useNavigate } from "react-router-dom";
// import { AddBulkInventry } from "../../components/modals";
// import { AuthContext } from '../../context/AuthContext';
// import { getViewerPerms, canViewInventory } from '../../utils/permissions';
// import { exportRowsAsPdf } from '../../utils/exportPdf';

// // Reusable ToggleSwitch component (small pill with sliding highlight)
// const ToggleSwitch = ({ viewType, setViewType }) => (
//   <div className="relative flex w-[30%] mb-4 bg-white rounded-full p-1 overflow-hidden border border-gray-200 h-10">
//     {/* Highlight */}
//     <div
//       className="absolute top-1 bottom-1 left-[2px] w-[calc(50%-6px)] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
//       style={{
//         transform: viewType === "Sales" ? "translateX(2px)" : "translateX(calc(100% + 6px))",
//       }}
//     />

//     <button
//       onClick={() => setViewType("Sales")}
//       className={`relative flex-1 h-full flex items-center justify-center px-3 text-base font-medium transition-colors z-10 whitespace-nowrap ${
//         viewType === "Sales" ? "text-white" : "text-gray-700"
//       }`}
//     >
//       Sales
//     </button>

//     <button
//       onClick={() => setViewType("Rent")}
//       className={`relative flex-1 h-full flex items-center justify-center px-3 text-base font-medium transition-colors z-10 whitespace-nowrap ${
//         viewType === "Rent" ? "text-white" : "text-gray-700"
//       }`}
//     >
//       Rent
//     </button>
//   </div>
// );

// const InventoryPage = () => {
//   const navigate = useNavigate();
//   const { data: allInventory = [], isLoading, error: isError } = useInventory();
//   const [viewType, setViewType] = useState('Sales');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [externalTokens, setExternalTokens] = useState([]);
//   const [currentPageRows, setCurrentPageRows] = useState([]);
//   const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

//   const { user: authUser } = useContext(AuthContext) || {};

//   // Normalize inventory data: backend may return an array or an object wrapper
//   const inventoryArray = React.useMemo(() => {
//     if (Array.isArray(allInventory)) return allInventory;
//     // common wrappers: { data: [...] } or { docs: [...] } or { inventory: [...] }
//     if (Array.isArray(allInventory?.data)) return allInventory.data;
//     if (Array.isArray(allInventory?.docs)) return allInventory.docs;
//     if (Array.isArray(allInventory?.inventory)) return allInventory.inventory;
//     // fallback: return empty array and warn in dev
//     if (allInventory && Object.keys(allInventory).length > 0) {
//       console.warn("useInventory returned unexpected shape, expected array. Returning empty list.", allInventory);
//     }
//     return [];
//   }, [allInventory]);

//   // Memoized filter - recalculates only when dependencies change
//   const filteredData = useMemo(() => {
//     const viewerPerms = getViewerPerms(authUser || {});
//     const viewLower = String(viewType || '').toLowerCase();

//     // first filter by requested view type
//     const arr = inventoryArray.filter((item) => {
//       const t = String(item.inventoryType || item.type || item.category || '').toLowerCase();
//       if (viewLower.includes('sale')) return t.includes('sale') || t.includes('sell');
//       if (viewLower.includes('rent')) return t.includes('rent') || t.includes('rental');
//       return true;
//     });

//     // now restrict per-item by permissions
//     return arr.filter(item => canViewInventory(viewerPerms, item));
//   }, [inventoryArray, viewType, authUser]);

//   // removed dev debug logging

//   if (isLoading)
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p className="text-gray-500 animate-pulse">Loading inventory...</p>
//       </div>
//     );

//   if (isError)
//     return (
//       <div className="p-4 text-center text-red-600 font-medium">
//         Failed to load inventory. Please try again later.
//       </div>
//     );

//   return (
//     <div className="p-1">
//       {/* Toggle Switch */}
//       <div className="flex flex-row justify-between mb-4">
//         <h2 className="text-2xl font-medium"> Inventory</h2>
//         <div className="flex flex-row gap-4">
//           <button 
//             className="btn"
//             onClick={() => setIsBulkUploadOpen(true)}
//           >
//             Add Bulk Inventory
//           </button>
//           <button className="btn" onClick={()=>{
//             navigate('/inventory/addInventory');
//           }}>Add Inventory</button>
//         </div>
//       </div>
//       {/* Toggle Switch with Search and Controls */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ">
//         {/* Toggle Switch */}
//         <div className="relative flex w-full lg:w-[30%] bg-white rounded-full p-1 overflow-hidden border border-gray-200">
//           {/* Highlight */}
//           <div
//             className="absolute top-1 bottom-1 left-[2px] w-[calc(50%-6px)] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
//             style={{
//               transform: viewType === "Sales" ? "translateX(2px)" : "translateX(calc(100% + 6px))",
//             }}
//           />

//           {/* Sales */}
//           <button
//             onClick={() => setViewType("Sales")}
//             className={`relative flex-1 px-3 py-2 text-base font-medium transition-colors z-10 whitespace-nowrap ${
//               viewType === "Sales" ? "text-white" : "text-gray-700"
//             }`}
//           >
//             Sales
//           </button>

//           {/* Rent */}
//           <button
//             onClick={() => setViewType("Rent")}
//             className={`relative flex-1 px-3 py-2 text-base font-medium transition-colors z-10 whitespace-nowrap ${
//               viewType === "Rent" ? "text-white" : "text-gray-700"
//             }`}
//           >
//             Rent
//           </button>
//         </div>

//         {/* Search and Controls */}
//         <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
//           <TokenSearch
//             value={searchTerm}
//             onChange={setSearchTerm}
//             tokens={externalTokens}
//             onTokensChange={setExternalTokens}
//           />
//           <button
//             className="btn ml-2"
//             onClick={() => {
//               const columns = [
//                 { key: 'sellerName', label: 'Seller' },
//                 { key: 'Project', label: 'Project' },
//                 { key: 'sector', label: 'Sector' },
//                 { key: 'unitNo', label: 'Unit No' },
//                 { key: 'towerNo', label: 'Tower No' },
//                 { key: 'demand', label: 'Demand' },
//                 { key: 'contactNumbers', label: 'Contact' },
//                 { key: 'date', label: 'Date' }
//               ];
//               const sourceRows = (currentPageRows && currentPageRows.length) ? currentPageRows : (filteredData || []);
//               const rows = sourceRows.map(r => ({
//                 sellerName: r.sellerName || '',
//                 Project: r.Project || r.project || '',
//                 sector: r.sector || r.sectorNo || '',
//                 unitNo: r.unitNo || '',
//                 towerNo: r.towerNo || '',
//                 demand: r.demand || '',
//                 contactNumbers: Array.isArray(r.contactNumbers) ? r.contactNumbers.join(', ') : r.contactNumbers || '',
//                 date: r.date || ''
//               }));
//               exportRowsAsPdf({ 
//                 columns, 
//                 rows, 
//                 fileName: 'inventory.pdf', 
//                 title: 'Inventory Export',
//                 watermark: { src: '/watermark.svg', opacity: 0.06, scale: 0.5, raw: true }
//               });
//             }}
//           >
//             Export all
//           </button>
//           {/* rows-per-page removed; InventoryTable renders inline entries select in its pagination */}
//         </div>
//       </div>

//       {/* Inventory Table */}
//       {filteredData.length > 0 ? (
//         <InventoryTable 
//           data={filteredData} 
//           hideSearch={true}
//           externalSearch={searchTerm}
//           onPageRowsChange={(rows) => setCurrentPageRows(rows)}
//         />
//       ) : (
//         <p className="text-gray-500 text-center py-10">
//           No {viewType.toLowerCase()} inventory found.
//         </p>
//       )}

//       {/* Bulk Upload Popup */}
//       <AddBulkInventry 
//         isOpen={isBulkUploadOpen} 
//         onClose={() => setIsBulkUploadOpen(false)} 
//       />
//     </div>
//   );
// };

// export default InventoryPage;






import React, { useState, useMemo, useContext, useEffect } from "react";
import TokenSearch from "../../components/ui/TokenSearch";
import { useInventory } from "../../hooks/useInventory";
import { InventoryTable } from "../../components/tables";
import { useNavigate, useLocation } from "react-router-dom";
import { AddBulkInventry } from "../../components/modals";
import { AuthContext } from "../../context/AuthContext";
import { getViewerPerms, canViewInventory } from "../../utils/permissions";
import ExportModal from "../../components/ui/ExportModal";
import { ToggleSwitch } from "../../components/ui";

const InventoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: allInventory = [], isLoading, error: isError } = useInventory();
  const [viewType, setViewType] = useState("Sales");
  const [searchTerm, setSearchTerm] = useState("");
  const [externalTokens, setExternalTokens] = useState([]);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [typologyFilter, setTypologyFilter] = useState('');

  // Handle navigation state for pre-selecting tab
  useEffect(() => {
    if (location.state?.selectedTab) {
      setViewType(location.state.selectedTab);
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const { user: authUser } = useContext(AuthContext) || {};
  const viewerPerms = getViewerPerms(authUser || {});
  const isAdmin = Boolean(viewerPerms?.superAdmin);

  // ✅ Normalize API response
  const inventoryArray = useMemo(() => {
    if (Array.isArray(allInventory)) return allInventory;
    if (Array.isArray(allInventory?.data)) return allInventory.data;
    if (Array.isArray(allInventory?.docs)) return allInventory.docs;
    if (Array.isArray(allInventory?.inventory)) return allInventory.inventory;
    return [];
  }, [allInventory]);

  // ✅ Filter logic
  const filteredData = useMemo(() => {
    const viewerPerms = getViewerPerms(authUser || {});
    const viewLower = String(viewType || "").toLowerCase();

    let arr = inventoryArray.filter((item) => {
      const type = String(item.inventoryType || item.type || item.category || "").toLowerCase();
      if (viewLower.includes("sale")) return type.includes("sale") || type.includes("sell");
      if (viewLower.includes("rent")) return type.includes("rent") || type.includes("rental");
      return true;
    });

    // Optional typology filter (hidden dropdown)
    if (typologyFilter) {
      const needle = String(typologyFilter).toLowerCase();
      arr = arr.filter((item) => {
        const vals = Array.isArray(item.typology) ? item.typology : (item.typology ? [item.typology] : []);
        return vals.some((v) => String(v).toLowerCase() === needle);
      });
    }

    return arr.filter((item) => canViewInventory(viewerPerms, item));
  }, [inventoryArray, viewType, authUser, typologyFilter]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 animate-pulse">Loading inventory...</p>
      </div>
    );

  if (isError)
    return (
      <div className="p-4 text-center text-red-600 font-medium">
        Failed to load inventory. Please try again later.
      </div>
    );

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex flex-row justify-between mb-4">
        <h2 className="text-2xl font-medium">Inventory</h2>
        <div className="flex flex-row gap-4">
          <button className="btn" onClick={() => setIsBulkUploadOpen(true)}>
            Add Bulk Inventory
          </button>
          <button
            className="btn"
            onClick={() => navigate("/inventory/addInventory")}
          >
            Add Inventory
          </button>
        </div>
      </div>

      {/* Toggle + Search + Export */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Toggle */}
        <div className="w-full lg:w-[30%]">
          <ToggleSwitch
            value={viewType}
            options={[{ value: 'Sales', label: 'Sales' }, { value: 'Rent', label: 'Rent' }]}
            onChange={setViewType}
            size="md"
          />
        </div>

        {/* Search + Export + Hidden Typology Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <TokenSearch
            value={searchTerm}
            onChange={setSearchTerm}
            tokens={externalTokens}
            onTokensChange={setExternalTokens}
          />

          {isAdmin && (
            <button
              className="btn ml-2"
              onClick={() => setIsExportModalOpen(true)}
            >
              Export
            </button>
          )}

          {/* Typology filter is now triggered from the table header. Options passed to table below. */}
        </div>
      </div>

      {/* Inventory Table */}
      {filteredData.length > 0 ? (
        <InventoryTable
          data={filteredData}
          hideSearch={true}
          externalSearch={searchTerm}
          externalTokens={externalTokens}
          onExternalTokensChange={setExternalTokens}
          typologyFilter={typologyFilter}
          onTypologyFilterChange={(val) => { setTypologyFilter(val); }}
          typologyOptions={Array.from(new Set(
            inventoryArray.flatMap((it) => Array.isArray(it.typology) ? it.typology : (it.typology ? [it.typology] : []))
          ))}
        />
      ) : (
        <p className="text-gray-500 text-center py-10">
          No {viewType.toLowerCase()} inventory found.
        </p>
      )}

      {/* Bulk Upload Modal */}
      <AddBulkInventry
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />

      {/* Export Modal */}
      {isAdmin && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          data={filteredData}
          fileName="inventory-export"
          title="Export Inventory"
          showDateRange={true}
          dateField="date"
        />
      )}
    </div>
  );
};

export default InventoryPage;




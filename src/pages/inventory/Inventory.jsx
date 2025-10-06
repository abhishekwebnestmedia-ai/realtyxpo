import React, { useState, useMemo } from "react";
import { useInventory } from "../../hooks/useInventory";
import { InventoryTable } from "../../components/tables";
import { useNavigate } from "react-router-dom";
import { AddBulkInventry } from "../../components/modals";

// Reusable ToggleSwitch component (framer-motion sliding rounded background)
const ToggleSwitch = ({ viewType, setViewType }) => (
 <div className="relative flex w-[30%] mb-4 bg-white rounded-full p-1 overflow-hidden border border-gray-200">
  {/* Highlight */}
  <div
    className="absolute top-1 bottom-1 left-[2px] w-[calc(50%-6px)] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
    style={{
      transform: viewType === "Sales" ? "translateX(2px)" : "translateX(calc(100% + 6px))",
    }}
  />

  {/* Sales */}
  <button
    onClick={() => setViewType("Sales")}
    className={`relative flex-1 px-3 py-2 text-base font-medium transition-colors z-10 whitespace-nowrap ${
      viewType === "Sales" ? "text-white" : "text-gray-700"
    }`}
  >
    Sales
  </button>

  {/* Rent */}
  <button
    onClick={() => setViewType("Rent")}
    className={`relative flex-1 px-3 py-2 text-base font-medium transition-colors z-10 whitespace-nowrap ${
      viewType === "Rent" ? "text-white" : "text-gray-700"
    }`}
  >
    Rent
  </button>
</div>

);

const InventoryPage = () => {
  const navigate = useNavigate();
  const { data: allInventory = [], isLoading, isError } = useInventory();
  const [viewType, setViewType] = useState("Sales");
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
console.log('All inventory data:', allInventory); // Debug log
  // Memoized filter - recalculates only when dependencies change
  const filteredData = useMemo(() => {
    return allInventory.filter((item) => item.inventoryType === viewType);
  }, [allInventory, viewType]);

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
      {/* Toggle Switch */}
      <div className="flex flex-row justify-between mb-4">
        <h2 className="text-2xl font-medium"> Inventory</h2>
        <div className="flex flex-row gap-4">
          <button 
            className="btn"
            onClick={() => setIsBulkUploadOpen(true)}
          >
            Add Bulk Inventory
          </button>
          <button className="btn" onClick={()=>{
            navigate('/inventory/addInventory');
          }}>Add Inventory</button>
        </div>
      </div>
      {/* Toggle Switch with Search and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ">
        {/* Toggle Switch */}
        <div className="relative flex w-full lg:w-[30%] bg-white rounded-full p-1 overflow-hidden border border-gray-200">
          {/* Highlight */}
          <div
            className="absolute top-1 bottom-1 left-[2px] w-[calc(50%-6px)] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
            style={{
              transform: viewType === "Sales" ? "translateX(2px)" : "translateX(calc(100% + 6px))",
            }}
          />

          {/* Sales */}
          <button
            onClick={() => setViewType("Sales")}
            className={`relative flex-1 px-3 py-2 text-base font-medium transition-colors z-10 whitespace-nowrap ${
              viewType === "Sales" ? "text-white" : "text-gray-700"
            }`}
          >
            Sales
          </button>

          {/* Rent */}
          <button
            onClick={() => setViewType("Rent")}
            className={`relative flex-1 px-3 py-2 text-base font-medium transition-colors z-10 whitespace-nowrap ${
              viewType === "Rent" ? "text-white" : "text-gray-700"
            }`}
          >
            Rent
          </button>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <input
            type="text"
            placeholder="Search..."
            className="border px-3 py-2 rounded-full w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-800 whitespace-nowrap">Rows per page:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="border border-gray-200 rounded-lg p-2 text-sm  hover:border-gray-300 focus:outline-none focus:ring-2  min-w-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 5%22><path fill=%22%23666%22 d=%22M2 0L0 2h4zm0 5L0 3h4z%22/></svg>')] bg-no-repeat bg-right bg-[length:12px] "
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredData.length > 0 ? (
        <InventoryTable 
          data={filteredData} 
          hideSearch={true}
          externalSearch={searchTerm}
          externalRowsPerPage={rowsPerPage}
        />
      ) : (
        <p className="text-gray-500 text-center py-10">
          No {viewType.toLowerCase()} inventory found.
        </p>
      )}

      {/* Bulk Upload Popup */}
      <AddBulkInventry 
        isOpen={isBulkUploadOpen} 
        onClose={() => setIsBulkUploadOpen(false)} 
      />
    </div>
  );
};

export default InventoryPage;


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
      <ToggleSwitch viewType={viewType} setViewType={setViewType} />

      {/* Inventory Table */}
      {filteredData.length > 0 ? (
        <InventoryTable data={filteredData} />
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


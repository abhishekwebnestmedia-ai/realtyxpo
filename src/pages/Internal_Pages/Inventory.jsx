import React, { useState, useMemo } from "react";
import { useInventory } from "../../hooks/useInventory";
import InventoryTable from "../../components/InventoryTable";

// Reusable ToggleSwitch component
const ToggleSwitch = ({ viewType, setViewType }) => (
  <div className="flex items-center gap-2 my-4">
    <span
      className={
        viewType === "Sales" ? "font-bold text-blue-600" : "text-gray-500"
      }
    >
      Sale
    </span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={viewType === "Rent"}
        onChange={(e) => setViewType(e.target.checked ? "Rent" : "Sales")}
      />
      <div
        className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300
          after:border after:rounded-full after:h-5 after:w-5 after:transition-all
          peer-checked:after:translate-x-full peer-checked:after:border-white"
      ></div>
    </label>
    <span
      className={
        viewType === "Rent" ? "font-bold text-blue-600" : "text-gray-500"
      }
    >
      Rent
    </span>
  </div>
);

const InventoryPage = () => {
  const { data: allInventory = [], isLoading, isError } = useInventory();
  const [viewType, setViewType] = useState("Sales");

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
    <div className="p-4">
      {/* Toggle Switch */}
      <ToggleSwitch viewType={viewType} setViewType={setViewType} />

      {/* Inventory Table */}
      {filteredData.length > 0 ? (
        <InventoryTable data={filteredData} />
      ) : (
        <p className="text-gray-500 text-center py-10">
          No {viewType.toLowerCase()} inventory found.
        </p>
      )}
    </div>
  );
};

export default InventoryPage;


// src/pages/leads/AllLeads.jsx
import React, { useState, useMemo } from "react";
import { useLeads } from "../../hooks/useLeads";
import { ScrollableLeads } from "../../components/dashboard";

import { useNavigate } from "react-router-dom";
import { AddBulkLead } from "../../components/modals";

const AllLeads = () => {
  const navigate = useNavigate();
  const { data: leadsRaw, isLoading, error } = useLeads();
  // console.log("Leads fetched:", leadsRaw);
  // Normalize possible response shapes
  const leads = useMemo(() => {
    if (Array.isArray(leadsRaw)) return leadsRaw;
    if (leadsRaw && Array.isArray(leadsRaw.data)) return leadsRaw.data;
    return [];
  }, [leadsRaw]);

  const [filter, setFilter] = useState("buyers");
  const [showBulkUploadPopup, setShowBulkUploadPopup] = useState(false);

  const isDead = (lead) =>
    typeof lead?.status === "string" && /dead/i.test(lead.status);

  const filteredLeads = useMemo(() => {
    if (!Array.isArray(leads)) return [];
    if (filter === "buyers")
      return leads.filter((l) => l?.leadType === "Buyer" && !isDead(l));
    if (filter === "rental")
      return leads.filter((l) => l?.leadType === "Rental" && !isDead(l));
    if (filter === "dead") return leads.filter((l) => isDead(l));
    return leads.filter((l) => !isDead(l));
  }, [leads, filter]);

  if (isLoading) return <p className="p-4">Loading leads...</p>;
  if (error) return <p className="p-4 text-red-500">Error loading leads</p>;

  // Helper for background slide position


  return (
    <div className="p-1">
      <div className="flex flex-row justify-between">
        <h2 className="pageheading">All Leads</h2>
        <div className="flex gap-4">
          <button 
            className="btn" 
            onClick={() => setShowBulkUploadPopup(true)}
          >
            Add Bulk Lead
          </button>
          <button
            className="btn"
            onClick={() => navigate("/all-leads/addLead")}
          >
            Add Lead
          </button>
        </div>
      </div>

      {/* Switch-like Tab Selector */}
      <div className="relative flex w-[49%] mb-4 mt-4 bg-white rounded-full p-1 overflow-hidden border border-gray-200">
        {/* Highlight */}
        <div
          className="absolute top-1 bottom-1 left-[2px] w-[calc(33.333%-6px)] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
          style={{
            transform:
              filter === "buyers"
                ? "translateX(2px)"
                : filter === "rental"
                ? "translateX(calc(100% + 6px))"
                : "translateX(calc(200% + 12px))",
          }}
        />

        {/* Buyers */}
        <button
          onClick={() => setFilter("buyers")}
          className={`relative flex-1 px-3 py-[0.65rem] text-sm font-medium transition-colors z-10 whitespace-nowrap ${
            filter === "buyers" ? "text-white" : "text-gray-700"
          }`}
        >
          <span className="relative z-10">All Buyers</span>
        </button>

        {/* Rental */}
        <button
          onClick={() => setFilter("rental")}
          className={`relative flex-1 px-3 py-[0.65rem] text-sm font-medium transition-colors z-10 whitespace-nowrap ${
            filter === "rental" ? "text-white" : "text-gray-700"
          }`}
        >
          <span className="relative z-10">Rental Business</span>
        </button>

        {/* Dead */}
        <button
          onClick={() => setFilter("dead")}
          className={`relative flex-1 px-3 py-[0.65rem] text-sm font-medium transition-colors z-10 whitespace-nowrap ${
            filter === "dead" ? "text-white" : "text-gray-700"
          }`}
        >
          <span className="relative z-10">Dead Leads</span>
        </button>
      </div>

      <ScrollableLeads data={filteredLeads} />

      {/* Bulk Upload Popup */}
      <AddBulkLead 
        isOpen={showBulkUploadPopup} 
        onClose={() => setShowBulkUploadPopup(false)} 
      />
    </div>
  );
};

export default AllLeads;

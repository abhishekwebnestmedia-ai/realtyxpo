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
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // table-specific filters removed — using page-level filteredLeads only

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

  const filteredAndTableFilteredLeads = filteredLeads;

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

      {/* Toggle Switch with Search and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mt-4">
        {/* Toggle Switch */}
        <div className="relative flex w-full lg:w-[49%] bg-white rounded-full p-1 overflow-hidden border border-gray-200">
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

      {/* Table-specific filters removed */}

      <ScrollableLeads 
        data={filteredAndTableFilteredLeads} 
        hideSearch={true}
        externalSearch={searchTerm}
        externalRowsPerPage={rowsPerPage}
      />

      {/* Bulk Upload Popup */}
      <AddBulkLead 
        isOpen={showBulkUploadPopup} 
        onClose={() => setShowBulkUploadPopup(false)} 
      />
    </div>
  );
};

export default AllLeads;

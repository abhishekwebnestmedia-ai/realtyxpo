// src/pages/leads/AllLeads.jsx
import React, { useState, useMemo } from "react";
import { useLeads } from "../../hooks/useLeads";
import ScrollableLeadsTable from "../../components/ScrollableLeads";
import { Link } from "react-router-dom";
const AllLeads = () => {
  const { data: leadsRaw, isLoading, error } = useLeads();

  // Normalize possible response shapes: array OR { data: [...] } OR undefined
  const leads = useMemo(() => {
    if (Array.isArray(leadsRaw)) return leadsRaw;
    if (leadsRaw && Array.isArray(leadsRaw.data)) return leadsRaw.data;
    return [];
  }, [leadsRaw]);

  const [filter, setFilter] = useState("buyers"); // buyers | rental | dead

  // helper to detect dead leads (case-insensitive)
  const isDead = (lead) => typeof lead?.status === "string" && /dead/i.test(lead.status);

  // ✅ Apply filter
  const filteredLeads = useMemo(() => {
    if (!Array.isArray(leads)) return [];
    if (filter === "buyers") return leads.filter((l) => l?.leadType === "Buyer" && !isDead(l));
    if (filter === "rental") return leads.filter((l) => l?.leadType === "Rental" && !isDead(l));
    if (filter === "dead") return leads.filter((l) => isDead(l));
    // default: exclude dead leads
    return leads.filter((l) => !isDead(l));
  }, [leads, filter]);

  if (isLoading) return <p className="p-4">Loading leads...</p>;
  if (error) return <p className="p-4 text-red-500">Error loading leads</p>;

  return (
    <div className="p-4">
      {/* ✅ Toggle buttons */}
      <div className="flex flex-row justify-between">
        <h2 className="text-2xl">All Leads</h2>
        <div className="flex gap-4">
          <button className="btn">Add Bulk Lead</button>
          <button className="btn">Add Lead</button>
        </div>
      </div>
      <div className="flex gap-3 mb-4 mt-4">
        <button
          onClick={() => setFilter("buyers")}
          className={`px-4 py-2 rounded ${
            filter === "buyers" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          All Buyers
        </button>
        <button
          onClick={() => setFilter("rental")}
          className={`px-4 py-2 rounded ${
            filter === "rental" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Rental Business
        </button>
        <button
          onClick={() => setFilter("dead")}
          className={`px-4 py-2 rounded ${
            filter === "dead" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Dead Leads
        </button>
      </div>

      {/* ✅ Pass filtered leads */}
      <ScrollableLeadsTable data={filteredLeads} />
    </div>
  );
};

export default AllLeads;

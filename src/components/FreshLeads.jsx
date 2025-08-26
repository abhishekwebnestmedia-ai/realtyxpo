import React from "react";
import { Filter, Download, Eye, Edit, Trash, ExternalLink, Pencil } from "lucide-react";

const FreshLeads = () => {
  const leads = [
    {
      source: "/icons/facebook.svg",
      name: "Abhishek Singh",
      date: "24 Aug, 2025",
      phone: "+91 9876543210",
      email: "abhishek@example.com",
      budget: "50k",
      type: "Purchase",
      requirement: "2BHK Flat",
    },
    {
      source: "/icons/instagram.svg",
      name: "Priya Sharma",
      date: "23 Aug, 2025",
      phone: "+91 8765432109",
      email: "priya@example.com",
      budget: "50k",
      type: "Rent",
      requirement: "1BHK Apartment",
    },
    {
      source: "/icons/youtube.svg",
      name: "Rahul Verma",
      date: "22 Aug, 2025",
      phone: "+91 7654321098",
      email: "rahul@example.com",
      budget: "50k",
      type: "Purchase",
      requirement: "3BHK Villa",
    },
  ];

  return (
    <div className=" rounded-2xl w-full mt-9 ">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl cursor-pointer">Fresh Leads</h2>
        <div className="flex gap-4 text-sm text-gray-600">
          <button className="flex items-center gap-1 hover:text-cyan-600">
            View All <ExternalLink size={16} />
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Filter <Filter size={16} />
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Download PDF <Download size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl scrollbar-hidden bg-white">
        <table className="w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-600">
              <th className="text-sm px-4 py-6 text-left text-nowrap">Lead Source</th>
              <th className="text-sm px-4 py-6 text-left ">Name</th>
              <th className="text-sm px-4 py-6 text-left text-nowrap">Lead Update On</th>
              <th className="text-sm px-4 py-6 text-left">Phone No.</th>
              <th className="text-sm px-4 py-6 text-left">Email</th>
              <th className="text-sm px-4 py-6 text-left">Budget</th>
              <th className="text-sm px-4 py-6 text-left">Type</th>
              <th className="text-sm px-4 py-6 text-left">Requirement</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <td className="px-4 py-3 flex justify-center">
                  <img src={lead.source} alt="Source" className="w-6 h-6" />
                </td>
                <td className="text-sm px-4 py-3 text-nowrap">{lead.name}</td>
                <td className="text-sm px-4 py-3">{lead.date}</td>
                <td className="text-sm px-4 py-3 text-nowrap">{lead.phone}</td>
                <td className="text-sm px-4 py-3">{lead.email}</td>
                <td className="text-sm px-4 py-3">
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                    {lead.budget}
                  </span>
                </td>
                <td className="text-sm px-4 py-3">{lead.type}</td>
                <td className="text-sm px-4 py-3">{lead.requirement}</td>
                <td className="text-sm px-4 py-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FreshLeads;

import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CheckSquare, PlusCircle } from "lucide-react";

const leads = [
  {
    id: 1,
    source: "/public/icons/99acres.svg",
    name: "Abhishek Singh",
    date: "3 June 2025",
    phone: "+91 8171 839997",
    email: "abhishek@realtyxpo.com",
    budget: "25k",
    type: "Rent",
    requirement: "Remark",
  },
  {
    id: 2,
    source: "/public/icons/99acres.svg",
    name: "Abhishek Singh",
    date: "3 June 2025",
    phone: "+91 8171 839997",
    email: "abhishek@realtyxpo.com",
    budget: "25k",
    type: "Rent",
    requirement: "Remark",
  },
  {
    id: 3,
    source: "/public/icons/99acres.svg",
    name: "Abhishek Singh",
    date: "3 June 2025",
    phone: "+91 8171 839997",
    email: "abhishek@realtyxpo.com",
    budget: "25k",
    type: "Rent",
    requirement: "Remark",
  },
  {
    id: 4,
    source: "/public/icons/99acres.svg",
    name: "Abhishek Singh",
    date: "3 June 2025",
    phone: "+91 8171 839997",
    email: "abhishek@realtyxpo.com",
    budget: "25k",
    type: "Rent",
    requirement: "Remark",
  },
  {
    id: 5,
    source: "/public/icons/99acres.svg",
    name: "Abhishek Singh",
    date: "3 June 2025",
    phone: "+91 8171 839997",
    email: "abhishek@realtyxpo.com",
    budget: "25k",
    type: "Rent",
    requirement: "Remark",
  },
];

export default function FreshLeads() {
  return (
    <section className="rounded-xl mt-9">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl">Fresh Leads</h2>
        <div className="flex gap-5 text-[13px] text-gray-600 font-medium">
          <button className="flex items-center gap-1 hover:text-cyan-600">
            View All
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Filter
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Download PDF
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-hide rounded-2xl">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="bg-[#FAFBFC] text-gray-700 border gap-4">
              <th className="w-10 text-center sticky left-0 z-10 mx-1 p-4 whitespace-nowrap">
                <CheckSquare size={18} />
              </th>
              <th className="text-left sticky left-12 z-10 text-sm px-5 py-6 font-medium whitespace-nowrap">
                Name
              </th>
              <th className="text-left px-10 py-6 text-sm whitespace-nowrap">
                Promises
              </th>
              <th className="text-left px-10 py-6 text-sm whitespace-nowrap">
                Online Portal Checked
              </th>
              <th className="text-left px-10 py-6 text-sm whitespace-nowrap">
                Whatsapp Status/ Post in Group
              </th>
              <th className="text-left px-10 py-6 text-sm whitespace-nowrap">
                Buyers Working
              </th>
              <th className="text-left px-10 py-6 text-sm whitespace-nowrap">
                Sellers Working
              </th>
              <th className="text-left px-10 py-6 text-sm whitespace-nowrap">
                Meeting
              </th>
              <th className="text-left px-10 py-6 text-sm whitespace-nowrap">
                Add More
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((person, idx) => (
              <React.Fragment key={idx}>
                {/* Morning Row */}
                <tr className="bg-[#FFF4BD] border-b">
                  <td
                    className="text-center z-10 bg-white sticky left-0 mx-1 p-4 whitespace-nowrap"
                    rowSpan={2}
                  >
                    <CheckSquare size={18} className="text-blue-500" />
                  </td>
                  <td
                    className="p-2 sticky z-10 left-12 bg-white whitespace-nowrap"
                    rowSpan={2}
                  >
                    {person.name}
                  </td>
                  <td className="py-4 px-6 font-medium whitespace-nowrap">
                    {person.morning.commitment}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.morning.portal}
                  </td>
                  <td className="py-4 px-6 font-semibold whitespace-nowrap">
                    {person.morning.whatsapp}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.morning.buyers}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.morning.sellers}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.morning.met}
                  </td>
                  <td className="p-2 text-center whitespace-nowrap">
                    <button className="text-blue-500 hover:text-blue-700">
                      <PlusCircle size={18} />
                    </button>
                  </td>
                </tr>

                {/* Evening Row */}
                <tr className="bg-[#FFC6C7] border-b">
                  <td className="py-4 px-6 font-medium whitespace-nowrap">
                    {person.evening.commitment}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.evening.portal}
                  </td>
                  <td className="py-4 px-6 font-semibold whitespace-nowrap">
                    {person.evening.whatsapp}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.evening.buyers}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.evening.sellers}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {person.evening.met}
                  </td>
                  <td className="py-4 text-center whitespace-nowrap">
                    <button className="text-blue-500 hover:text-blue-700">
                      <PlusCircle size={18} />
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

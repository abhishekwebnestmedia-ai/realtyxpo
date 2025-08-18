import { CheckSquare, Filter, Download, ExternalLink, PlusCircle } from "lucide-react";
import React from "react";

const TodaysTask = () => {
  const data = [
    {
      name: "Abhishek Singh",
      morning: { commitment: "Morning Commitment", portal: 32, whatsapp: 54, buyers: "-", sellers: 53, met: 53 },
      evening: { commitment: "Evening Achievements", portal: 28, whatsapp: 60, buyers: "-", sellers: 53, met: 53 },
    },
    {
      name: "Abhishek Singh",
      morning: { commitment: "Morning Commitment", portal: 32, whatsapp: 54, buyers: "-", sellers: 53, met: 53 },
      evening: { commitment: "Evening Achievements", portal: 28, whatsapp: 60, buyers: "-", sellers: 53, met: 53 },
    },
    {
      name: "Abhishek Singh",
      morning: { commitment: "Morning Commitment", portal: 32, whatsapp: 54, buyers: "-", sellers: 53, met: 53 },
      evening: { commitment: "Evening Achievements", portal: 28, whatsapp: 60, buyers: "-", sellers: 53, met: 53 },
    },
    {
      name: "Abhishek Singh",
      morning: { commitment: "Morning Commitment", portal: 32, whatsapp: 54, buyers: "-", sellers: 53, met: 53 },
      evening: { commitment: "Evening Achievements", portal: 28, whatsapp: 60, buyers: "-", sellers: 53, met: 53 },
    },
  ];

  return (
    <section className="rounded-lg mt-9">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl cursor-pointer">Today's Task</h2>
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
      <div className="overflow-x-auto scrollbar-hide rounded-2xl">
  <table className="w-full min-w-max text-sm">
    <thead>
      <tr className="bg-[#FAFBFC] text-gray-700  gap-4 ">
        <th className="w-10 text-center sticky left-0 z-20 bg-[#FAFBFC] p-4">
          <CheckSquare size={18} />
        </th>
        <th className="text-left sticky left-14 z-20 bg-[#FAFBFC] text-sm px-5 py-6 font-medium">
          Name
        </th>
        <th className="text-left px-10 py-6 text-sm">Promises</th>
        <th className="text-left px-10 py-6 text-sm">Online Portal Checked</th>
        <th className="text-left px-10 py-6 text-sm">Whatsapp Status/ Post in Group</th>
        <th className="text-left px-10 py-6 text-sm">Buyers Working</th>
        <th className="text-left px-10 py-6 text-sm">Sellers Working</th>
        <th className="text-left px-10 py-6 text-sm">Meeting</th>
        <th className="text-left px-10 py-6 text-sm">Add More</th>
      </tr>
    </thead>
    <tbody>
      {data.map((person, idx) => (
        <React.Fragment key={idx}>
          {/* Morning Row */}
          <tr className="bg-[#FFF4BD] border-b">
            <td
              className="text-center sticky left-0 z-10 bg-white p-4"
              rowSpan={2}
            >
              <CheckSquare size={18} className="text-blue-500" />
            </td>
            <td
              className="p-2 px-6 sticky left-[48px] z-10 bg-white"
              rowSpan={2}
            >
              {person.name}
            </td>
            <td className="py-4 px-6 font-medium">{person.morning.commitment}</td>
            <td className="py-4 px-6">{person.morning.portal}</td>
            <td className="py-4 px-6 font-semibold">{person.morning.whatsapp}</td>
            <td className="py-4 px-6">{person.morning.buyers}</td>
            <td className="py-4 px-6">{person.morning.sellers}</td>
            <td className="py-4 px-6">{person.morning.met}</td>
            <td className="p-2 text-center">
              <button className="text-blue-500 hover:text-blue-700">
                <PlusCircle size={18} />
              </button>
            </td>
          </tr>

          {/* Evening Row */}
          <tr className="bg-[#FFC6C7] border-b">
            <td className="py-4 px-6 font-medium">{person.evening.commitment}</td>
            <td className="py-4 px-6">{person.evening.portal}</td>
            <td className="py-4 px-6 font-semibold">{person.evening.whatsapp}</td>
            <td className="py-4 px-6">{person.evening.buyers}</td>
            <td className="py-4 px-6">{person.evening.sellers}</td>
            <td className="py-4 px-6">{person.evening.met}</td>
            <td className="py-4 text-center">
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


      {/* Hide scrollbar style */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TodaysTask;

import React, { useState } from "react";
import { CheckSquare, Filter, Download, ExternalLink, PlusCircle } from "lucide-react";
import Pagination from "./pagination";

const TodaysTask = ({ rowsPerPage = 4, showPagination = true, maxRows = null }) => {
  const data = [
    {
      name: "Abhishek Singh", 
      morning: { commitment: "Morning Commitment", portal: 32, whatsapp: 54, buyers: "-", sellers: 53, met: 53 },
      evening: { commitment: "Evening Achievements", portal: 28, whatsapp: 60, buyers: "-", sellers: 53, met: 53 },
    },
    {
      name: "Rahul Sharma",
      morning: { commitment: "Morning Commitment", portal: 20, whatsapp: 45, buyers: 10, sellers: 23, met: 12 },
      evening: { commitment: "Evening Achievements", portal: 25, whatsapp: 48, buyers: 15, sellers: 28, met: 14 },
    },
    {
      name: "Priya Mehta",
      morning: { commitment: "Morning Commitment", portal: 30, whatsapp: 60, buyers: 12, sellers: 30, met: 18 },
      evening: { commitment: "Evening Achievements", portal: 33, whatsapp: 62, buyers: 14, sellers: 32, met: 20 },
    },
    {
      name: "Rohit Verma",
      morning: { commitment: "Morning Commitment", portal: 18, whatsapp: 40, buyers: 8, sellers: 20, met: 10 },
      evening: { commitment: "Evening Achievements", portal: 21, whatsapp: 42, buyers: 9, sellers: 22, met: 11 },
    },
    {
      name: "Neha Kapoor",
      morning: { commitment: "Morning Commitment", portal: 40, whatsapp: 70, buyers: 20, sellers: 35, met: 25 },
      evening: { commitment: "Evening Achievements", portal: 42, whatsapp: 72, buyers: 21, sellers: 36, met: 26 },
    },
    ...Array(10).fill({
      name: "Sample User",
      morning: { commitment: "Morning Commitment", portal: 15, whatsapp: 30, buyers: 8, sellers: 18, met: 10 },
      evening: { commitment: "Evening Achievements", portal: 20, whatsapp: 32, buyers: 9, sellers: 20, met: 12 },
    }),
  ];
 
  const [currentPage, setCurrentPage] = useState(1);

  const displayData = maxRows ? data.slice(0, maxRows) : data;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = showPagination
    ? displayData.slice(indexOfFirstRow, indexOfLastRow)
    : displayData;

  const totalPages = Math.ceil(displayData.length / rowsPerPage);

  return (
    <section className="rounded-lg">
      {/* Header */}
   
      {/* Table */}
      <div className="overflow-x-auto scrollbar-hide rounded-2xl">
        <table className="relative w-full text-sm border-collapse min-w-max">
          <thead>
            <tr className="bg-[#FAFBFC] text-gray-700">
              <th className="w-10 text-center  z-30 bg-[#FAFBFC] p-4">
                <CheckSquare size={18} />
              </th>
              <th className="text-left  z-30 bg-[#FAFBFC] px-4 py-6">Name</th>
              <th className="px-10 py-6 text-sm text-left">Promises</th>
              <th className="px-10 py-6 text-sm text-left">Online Portal Checked</th>
              <th className="px-10 py-6 text-sm text-left">Whatsapp Status/ Post in Group</th>
              <th className="px-10 py-6 text-sm text-left">Buyers Working</th>
              <th className="px-10 py-6 text-sm text-left">Sellers Working</th>
              <th className="px-10 py-6 text-sm text-left">Meeting</th>
              <th className="px-10 py-6 text-sm text-left">Add More</th>
            </tr>
          </thead>
          <tbody className="">
            {currentRows.map((person, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-[#FFF4BD] border-b ">
                  <td className="sticky  z-20 p-4 text-center bg-white" rowSpan={2}>
                    <CheckSquare size={18} className="text-blue-500" />
                  </td>
                  <td className="px-3  z-20 bg-white" rowSpan={2}>
                    {person.name}
                  </td>
                  <td className="px-6 py-4 font-medium ">{person.morning.commitment}</td>
                  <td className="px-6 py-4">{person.morning.portal}</td>
                  <td className="px-6 py-4 font-semibold">{person.morning.whatsapp}</td>
                  <td className="px-6 py-4">{person.morning.buyers}</td>
                  <td className="px-6 py-4">{person.morning.sellers}</td>
                  <td className="px-6 py-4">{person.morning.met}</td>
                  <td className="p-2 text-center">
                    <button className="text-blue-500 hover:text-blue-700">
                      <PlusCircle size={18} />
                    </button>
                  </td>
                </tr>

                <tr className="bg-[#FFC6C7] border-b">
                  <td className="px-6 py-4 font-medium">{person.evening.commitment}</td>
                  <td className="px-6 py-4">{person.evening.portal}</td>
                  <td className="px-6 py-4 font-semibold">{person.evening.whatsapp}</td>
                  <td className="px-6 py-4">{person.evening.buyers}</td>
                  <td className="px-6 py-4">{person.evening.sellers}</td>
                  <td className="px-6 py-4">{person.evening.met}</td>
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

      {/* Pagination */}
      {showPagination && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(num) => setCurrentPage(num)}
        />
      )}

      {/* Hide scrollbar style */}
      <style>{`
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

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Pagination from "./Pagination";
import { ChevronDown, ListFilter, Pencil, Trash2 } from "lucide-react";

const Table = () => {
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [typologyDropdownOpen, setTypologyDropdownOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  // ✅ Data
  const buyersData = [
    {
      id: 1,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 2,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
    {
      id: 3,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 4,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
    {
      id: 5,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 6,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
    {
      id: 7,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 8,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
    {
      id: 9,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 10,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
    {
      id: 11,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 12,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
    {
      id: 13,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 14,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
    {
      id: 15,
      sellerName: "John Doe",
      sector: "45",
      unit: "12",
      tower: "A",
      typology: "3BHK",
      size: "1500 sq.ft",
      demand: "₹75L",
      contact: ["9876543210", "9876500000"],
      email: "john@example.com",
      paymentStatus: "Partial",
      registerTransferred: "Registered",
      requirement: "High floor",
      date: "2025-08-25",
      capturedBy: "Agent 1",
      assignedTo: "Agent 2",
      transferTo: "Agent 3",
      followupDate: "2025-09-01",
      source: "Website",
      loanStatus: "Pending",
      remarks: "Follow up",
    },
    {
      id: 16,
      sellerName: "Jane Smith",
      sector: "23",
      unit: "9",
      tower: "B",
      typology: "2BHK",
      size: "1100 sq.ft",
      demand: "₹55L",
      contact: ["8765432109"],
      email: "jane@example.com",
      paymentStatus: "Complete",
      registerTransferred: "Transferred",
      requirement: "Park facing",
      date: "2025-08-20",
      capturedBy: "Agent 4",
      assignedTo: "Agent 5",
      transferTo: "Agent 6",
      followupDate: "2025-08-30",
      source: "Referral",
      loanStatus: "Approved",
      remarks: "Confirmed",
    },
  ];

  const rentalData = [...buyersData];
  const [activeTab, setActiveTab] = useState("buyers");
  const data = activeTab === "buyers" ? buyersData : rentalData;

  // ✅ Pagination logic
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleDropdownToggle = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
    setTypologyDropdownOpen(null);
  };

  const handleTypologyDropdownToggle = (id) => {
    setTypologyDropdownOpen(typologyDropdownOpen === id ? null : id);
    setDropdownOpen(null);
  };

  // ✅ Close dropdown on outside click using event.target.closest()
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".payment-dropdown") &&
        !event.target.closest(".typology-dropdown") &&
        !event.target.closest(".dropdown-button")
      ) {
        setDropdownOpen(null);
        setTypologyDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full h-full rounded-2xl ">
      {/* ✅ Header with Tab and Buttons */}
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="relative flex p-1 mt-6 bg-white rounded-full w-72">
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-full bg-[#000D55]"
            style={{
              left: activeTab === "buyers" ? "0.25rem" : "calc(50% + 0.1rem)",
            }}
          />
          <button
            onClick={() => setActiveTab("buyers")}
            className={`relative z-10 flex-1 text-center py-2 font-medium rounded-full ${
              activeTab === "buyers" ? "text-white" : "text-gray-700"
            }`}
          >
            Sale
          </button>
          <button
            onClick={() => setActiveTab("rental")}
            className={`relative z-10 flex-1 text-center py-2 font-medium rounded-full ${
              activeTab === "rental" ? "text-white" : "text-gray-700"
            }`}
          >
            Rent
          </button>
        </div>
        <div className="flex flex-row items-center justify-center gap-3 text-sm text-gray-600">
          <button className="flex items-center gap-1 transition hover:text-cyan-600">
            View All <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-1 transition hover:text-cyan-600">
            Filter <ListFilter size={16} />
          </button>
        </div>
      </div>

      {/* ✅ Scrollable Table */}
      <div className="h-full mt-5 overflow-x-auto rounded-xl scrollbar-hidden">
        <table className="min-w-[180rem] text-sm ">
          <thead className="text-gray-700 bg-[#FAFBFC] border-b">
            <tr>
              <th className="py-6 min-w-[4rem]">
                <input type="checkbox" />
              </th>
              <th className="py-6 px-4 min-w-[10rem] text-left">Seller Name</th>
              <th className="py-6 px-4 min-w-[8rem]">Sector No.</th>
              <th className="py-6 px-4 min-w-[6rem] text-left">Unit</th>
              <th className="py-6 px-4 min-w-[6rem] text-left">Tower</th>
              <th className="py-6 px-4 min-w-[8rem] text-left">Typology</th>
              <th className="py-6 px-4 min-w-[10rem] text-left">Size</th>
              <th className="py-6 px-4 min-w-[10rem] text-left">Demand</th>
              <th className="py-6 px-4 min-w-[12rem] text-left">Contact No.</th>
              <th className="py-6 px-4 min-w-[14rem] text-left">Email</th>
              <th className="py-6 px-4 min-w-[12rem] text-left">
                Payment Status
              </th>
              <th className="py-6 px-4 min-w-[14rem] text-left">
                Register/Transferred
              </th>
              <th className="py-6 px-4 min-w-[14rem] text-left">Requirement</th>
              <th className="py-6 px-4 min-w-[14rem] text-left">Date</th>
              <th className="py-6 px-4 min-w-[14rem] text-left">Captured By</th>
              <th className="py-6 px-4 min-w-[14rem] text-left">Assigned To</th>
              <th className="py-6 px-4 min-w-[14rem] text-left">Transfer To</th>
              <th className="py-6 px-4 min-w-[14rem] text-left">
                Follow-up Date
              </th>
              <th className="py-6 px-4 min-w-[14rem] text-left">Source</th>
              <th className="py-6 px-4 min-w-[12rem] text-left">Loan Status</th>
              <th className="py-6 px-4 min-w-[12rem] text-left">Remarks</th>
              <th className="py-6 px-4 min-w-[8rem] text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr
                key={row.id}
                className="relative bg-white border-b hover:bg-gray-50"
              >
                <td className="text-center">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3">{row.sellerName}</td>
                <td className="px-4 py-3 text-center">{row.sector}</td>
                <td className="px-4 py-3">{row.unit}</td>
                <td className="px-4 py-3">{row.tower}</td>

                {/* ✅ Typology Dropdown */}
                <td className="relative px-4 py-3">
                  <button
                    onClick={() => handleTypologyDropdownToggle(row.id)}
                    className="flex flex-row items-center justify-center gap-2 px-4 dropdown-button"
                  >
                    {row.typology}
                    <ChevronDown size={14} />
                  </button>
                  {typologyDropdownOpen === row.id && (
                    <div className="absolute left-0 z-50 w-48 mt-2 bg-white border rounded shadow-lg top-full typology-dropdown">
                      <ul>
                        <li className="p-2 cursor-pointer hover:bg-gray-100">
                          1BHK
                        </li>
                        <li className="p-2 cursor-pointer hover:bg-gray-100">
                          2BHK
                        </li>
                        <li className="p-2 cursor-pointer hover:bg-gray-100">
                          3BHK
                        </li>
                        <li className="p-2 cursor-pointer hover:bg-gray-100">
                          4BHK
                        </li>
                      </ul>
                    </div>
                  )}
                </td>

                <td className="px-4 py-3">{row.size}</td>
                <td className="px-4 py-3">{row.demand}</td>

                {/* ✅ Multiple Contacts */}
                <td className="px-4 py-3 text-[#051226]">
                  {row.contact.map((num, index) => (
                    <div key={index}>{num}</div>
                  ))}
                </td>

                <td className="px-4 py-3 text-[#051226]">{row.email}</td>

                {/* ✅ Payment Status Dropdown */}
                <td className="relative px-4 py-3">
                  <button
                    onClick={() => handleDropdownToggle(row.id)}
                    className="flex flex-row items-center justify-center gap-2 px-4 dropdown-button"
                  >
                    {row.paymentStatus}
                    <ChevronDown size={14} />
                  </button>
                  {dropdownOpen === row.id && (
                    <div className="absolute left-0 z-50 w-48 mt-2 bg-white border rounded shadow-lg top-full payment-dropdown">
                      <ul>
                        <li className="p-2 cursor-pointer hover:bg-gray-100">
                          Partial Payment - ₹30L Pending
                        </li>
                        <li className="p-2 cursor-pointer hover:bg-gray-100">
                          Full Payment
                        </li>
                        <li className="p-2 cursor-pointer hover:bg-gray-100">
                          Cancel Payment
                        </li>
                      </ul>
                    </div>
                  )}
                </td>

                <td className="px-4 py-3">{row.registerTransferred}</td>
                <td className="px-4 py-3">{row.requirement}</td>
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.capturedBy}</td>
                <td className="px-4 py-3">{row.assignedTo}</td>
                <td className="px-4 py-3">{row.transferTo}</td>
                <td className="px-4 py-3">{row.followupDate}</td>
                <td className="px-4 py-3">{row.source}</td>
                <td className="px-4 py-3">{row.loanStatus}</td>
                <td className="px-4 py-3">{row.remarks}</td>
                <td className="px-4 py-3">
  <div className="flex items-center justify-center gap-2">
    <button className="text-[#00E029] hover:underline">
      <Pencil size={16} />
    </button>
    <button className="text-red-500">
      <Trash2 size={16} />
    </button>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination Component */}
      <div className="pb-8">
        <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      </div>
    </div>
  );
};

export default Table;

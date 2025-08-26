import React, { useState } from "react";

const buyersData = [
  {
    id: 1,
    name: "John Doe",
    phone: "9876543210",
    email: "john@example.com",
    budget: "₹50L - ₹70L",
    requirement: "3BHK",
    location: "Gurgaon",
    source: "Website",
    agent: "Rahul",
    status: "Hot",
    date: "2025-08-25",
  },
  {
    id: 2,
    name: "Priya Sharma",
    phone: "9876503210",
    email: "priya@example.com",
    budget: "₹30L - ₹50L",
    requirement: "2BHK",
    location: "Noida",
    source: "Referral",
    agent: "Ankit",
    status: "Warm",
    date: "2025-08-24",
  },
];

const rentalData = [
  {
    id: 1,
    name: "Amit Kumar",
    phone: "9876540000",
    email: "amit@example.com",
    budget: "₹15K - ₹20K",
    requirement: "2BHK",
    location: "Delhi",
    source: "Facebook",
    agent: "Sonia",
    status: "Cold",
    date: "2025-08-20",
  },
];

const CRMTable = () => {
  const [activeTab, setActiveTab] = useState("buyers");

  const data = activeTab === "buyers" ? buyersData : rentalData;

  return (
    <div className="p-4">
      {/* Toggle Switch */}
      <div className="flex gap-2 mb-4 bg-gray-200 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("buyers")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "buyers"
              ? "bg-blue-500 text-white"
              : "text-gray-700"
          }`}
        >
          All Buyers
        </button>
        <button
          onClick={() => setActiveTab("rental")}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === "rental"
              ? "bg-blue-500 text-white"
              : "text-gray-700"
          }`}
        >
          Rental Business
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto max-h-[500px] border rounded-lg ">
        <table className="min-w-[1200px] border-collapse mx-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border sticky left-0 bg-gray-100 z-20 w-[50px]">
                <input type="checkbox" />
              </th>
              <th className="p-3 border sticky left-[50px] bg-gray-100 z-20 w-[200px]">
                Name
              </th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Budget</th>
              <th className="p-3 border">Requirement</th>
              <th className="p-3 border">Location</th>
              <th className="p-3 border">Source</th>
              <th className="p-3 border">Agent</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3 border sticky left-0 bg-white z-10">
                  <input type="checkbox" />
                </td>
                <td className="p-3 border sticky left-[50px] bg-white z-10">
                  {item.name}
                </td>
                <td className="p-3 border">{item.phone}</td>
                <td className="p-3 border">{item.email}</td>
                <td className="p-3 border">{item.budget}</td>
                <td className="p-3 border">{item.requirement}</td>
                <td className="p-3 border">{item.location}</td>
                <td className="p-3 border">{item.source}</td>
                <td className="p-3 border">{item.agent}</td>
                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      item.status === "Hot"
                        ? "bg-red-100 text-red-600"
                        : item.status === "Warm"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="p-3 border">{item.date}</td>
                <td className="p-3 border flex gap-2">
                  <button className="text-blue-500">Edit</button>
                  <button className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CRMTable;

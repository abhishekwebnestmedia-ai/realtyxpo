import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: [
    "Site Visit",
    "Calling to buyers",
    "Sale Inventory",
    "Hot Leads",
    "Tenants",
    "Buyers",
    "Calling to Sellers",
    "Rent Inventory",
  ],
  datasets: [
    {
      data: [4, 4, 7, 5, 6, 6, 6, 6],
      backgroundColor: [
        "#54D0E0", // Site Visit
        "#F062C0", // Calling to buyers
        "#A05027", // Sale Inventory
        "#F44336", // Hot Leads
        "#FFEB3B", // Tenants
        "#0B0D57", // Buyers
        "#3F51B5", // Calling to Sellers
        "#FFB84D", // Rent Inventory
      ],
      borderWidth: 0,
      cutout: "75%",
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};

export default function LeadsChart() {
  const legendItems = [
    { color: "#54D0E0", label: "Site Visit", value: 4 },
    { color: "#F062C0", label: "Calling to buyers", value: 4 },
    { color: "#A05027", label: "Sale Inventory", value: 7 },
    { color: "#F44336", label: "Hot Leads", value: 5 },
    { color: "#FFEB3B", label: "Tenants", value: 6 },
    { color: "#0B0D57", label: "Buyers", value: 6 },
    { color: "#3F51B5", label: "Calling to Sellers", value: 6 },
    { color: "#FFB84D", label: "Rent Inventory", value: 6 },
  ];

  return (
    <div className="bg-[#F4F6FF] p-6 rounded-2xl flex items-center gap-10 w-[40%]">
      {/* Chart with center text */}
      <div className="relative w-40 h-40">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#61D26D]">29</span>
          <span className="text-gray-500 text-sm">Total Leads</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 gap-2">
        {legendItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between w-40">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-gray-700 text-sm">{item.label}</span>
            </div>
            <span className="text-gray-700 text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import ReactApexChart from "react-apexcharts";

export default function LeadsChart() {
  const chartOptions = {
    chart: {
      type: "donut",
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false, // Custom legend displayed manually
    },
    tooltip: {
      enabled: false,
    },
    colors: [
      "#54D0E0", // Site Visit
      "#F062C0", // Calling to buyers
      "#A05027", // Sale Inventory
      "#F44336", // Hot Leads
      "#FFEB3B", // Tenants
      "#0B0D57", // Buyers
      "#3F51B5", // Calling to Sellers
      "#FFB84D", // Rent Inventory
    ],
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: false,
          },
        },
      },
    },
  };

  const series = [4, 4, 7, 5, 6, 6, 6, 6];

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
    <div className="bg-[#F4F6FF] p-6 rounded-2xl flex items-center justify-around w-full h-full">
      {/* Apex Donut Chart */}
      <div className="relative w-40 h-40">
        <ReactApexChart
          options={chartOptions}
          series={series}
          type="donut"
          height={160}
        />
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#61D26D]">44</span>
          <span className="text-gray-500 text-sm">Total Leads</span>
        </div>
      </div>

      {/* Custom Legend */}
      {/* Custom Legend */}
      <div className="grid grid-cols-1 gap-2 ">
        {legendItems.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between w-full gap-8"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span
                className="text-gray-700 text-sm text-nowrap "
                title={item.label}
              >
                {item.label}
              </span>
            </div>
            <span className="text-gray-700 text-sm flex-shrink-0">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

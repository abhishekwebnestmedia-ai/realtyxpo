
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import api from "../../api/api";

const cardConfig = [
  { label: "Site Visit", color: "#54D0E0" },
  { label: "Calling to Buyers", color: "#F062C0" },
  { label: "Sale Inventory", color: "#A05027" },
  { label: "Hot Leads", color: "#F44336" },
  { label: "Tenants", color: "#FFEB3B" },
  { label: "Buyers", color: "#0B0D57" },
  { label: "Calling to Sellers", color: "#3F51B5" },
  { label: "Rent Inventory", color: "#FFB84D" },
];


export default function PieChartSection() {
  const [leadData, setLeadData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/card");
        const dataObj = {};
        response.data.forEach(item => {
          dataObj[item.title] = item.value;
        });
        setLeadData(dataObj);
      } catch (err) {
        setError("Failed to fetch lead details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const series = cardConfig.map(card => leadData[card.label] ?? 0);
  const totalLeads = series.reduce((sum, val) => sum + val, 0);

  const chartOptions = {
    chart: {
      type: "donut",
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
    },
    colors: cardConfig.map(card => card.color),
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
        },
      },
    },
    fill: {
      opacity: series.map((_, i) => activeIndex === null ? 1 : (i === activeIndex ? 1 : 0.3)),
    },
  };

  return (
    <div className="bg-[#F4F6FF] p-6 rounded-2xl flex items-center justify-around w-full h-full">
      {/* Apex Pie Chart */}
      <div className="relative w-40 h-40">
        {loading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500">{error}</div>
        ) : (
          <>
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="donut"
              height={160}
            />
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#61D26D]">{totalLeads}</span>
              <span className="text-gray-500 text-sm">Total Leads</span>
            </div>
          </>
        )}
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-1 gap-2 ">
        {cardConfig.map((item, i) => {
          // Fade non-active items, darken active
          const faded = activeIndex !== null && activeIndex !== i;
          return (
            <div
              key={i}
              className="flex items-center justify-between w-full gap-8"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{ cursor: 'pointer', opacity: faded ? 0.3 : 1 }}
            >
              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color, filter: activeIndex === i ? 'brightness(0.7)' : 'none' }}
                ></span>
                <span
                  className={`text-gray-700 text-sm text-nowrap ${activeIndex === i ? 'font-semibold' : ''}`}
                  style={{ filter: activeIndex === i ? 'brightness(0.7)' : 'none' }}
                  title={item.label}
                >
                  {item.label}
                </span>
              </div>
              <span className="text-gray-700 text-sm flex-shrink-0">
                {leadData[item.label] ?? 0}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

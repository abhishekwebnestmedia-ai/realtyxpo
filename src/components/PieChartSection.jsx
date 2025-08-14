const PieChartSection = () => {
  const segments = [
    { color: '#4ade80', label: 'Site Visit', value: 4 },
    { color: '#f472b6', label: 'Calling to buyers', value: 4 },
    { color: '#f87171', label: 'Sale Inventory', value: 7 },
    { color: '#f87171', label: 'Hot Leads', value: 5 },
    { color: '#fde68a', label: 'Tenants', value: 6 },
    { color: '#2563eb', label: 'Buyers', value: 6 },
    { color: '#4b5563', label: 'Calling to Sellers', value: 6 },
    { color: '#fdc78e', label: 'Rent Inventory', value: 6 },
  ];

  return (
    <div className="flex flex-col rounded-lg border border-gray-300 p-5 max-w-xs">
      <div className="flex gap-2 flex-wrap mb-4 text-xs">
        {segments.map(({ color, label, value }) => (
          <div key={label} className="flex items-center gap-1">
            <span className="block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span>{label}</span>
            <span className="font-semibold ml-1"> {value}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center mb-4">
        {/* Circle with strokes replaced by a simple circle + number */}
        <div className="flex flex-col justify-center items-center w-24 h-24 rounded-full border-8 border-gradient-to-tr from-red-400 via-yellow-300 to-red-400 text-gray-700 font-semibold text-3xl">
          <span>29</span>
          <span className="text-xs">Total Leads</span>
        </div>
      </div>
    </div>
  );
};
export default PieChartSection;

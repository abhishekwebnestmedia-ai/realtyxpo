const OverallLeadsDetails = () => {
  const leadCards = [
    { label: 'Site Visit', value: 80, color: 'bg-cyan-200', textColor: 'text-cyan-600' },
    { label: 'Calling to Buyers', value: 80, color: 'bg-pink-200', textColor: 'text-pink-600' },
    { label: 'Sale Inventory', value: 80, color: 'bg-orange-300', textColor: 'text-orange-700' },
    { label: 'Hot Leads', value: 80, color: 'bg-red-300', textColor: 'text-red-700' },
    { label: 'Tenants', value: 80, color: 'bg-yellow-300', textColor: 'text-yellow-700' },
    { label: 'Buyres', value: 80, color: 'bg-slate-800', textColor: 'text-white' },
    { label: 'Calling to Sellers', value: 80, color: 'bg-blue-300', textColor: 'text-blue-700' },
    { label: 'Rent Inventory', value: 80, color: 'bg-yellow-200', textColor: 'text-yellow-700' },
  ];

  return (
    <section className="flex flex-wrap gap-4 rounded-lg border border-gray-300 p-5 max-w-4xl">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="font-semibold">Overall Leads Details</h2>
        <div className="flex gap-3 text-xs text-gray-600">
          <button className="flex items-center gap-1 hover:text-cyan-600">
            View All <span>⌄</span>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Filter <span>⚙</span>
          </button>
        </div>
      </div>
      {leadCards.map(({ label, value, color, textColor }) => (
        <div
          key={label}
          className={`flex flex-col px-4 py-3 rounded-lg shadow-sm ${color} ${textColor} w-40`}
        >
          <h3 className="text-xs font-semibold mb-2">{label}</h3>
          <p className="text-xl font-bold">{value}</p>
        </div>
      ))}
    </section>
  );
};
export default OverallLeadsDetails;

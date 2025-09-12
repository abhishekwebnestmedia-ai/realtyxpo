import { ChevronDown, Filter, NotepadText } from "lucide-react";

const OverallLeadsDetails = () => {
  const leadCards = [
    { label: 'Site Visit', value: 80, borderColor: 'border-cyan-400', bgColor: 'bg-cyan-400', textColor: 'text-cyan-600' },
    { label: 'Calling to Buyers', value: 80, borderColor: 'border-pink-400', bgColor: 'bg-pink-400', textColor: 'text-pink-600' },
    { label: 'Sale Inventory', value: 80, borderColor: 'border-orange-500', bgColor: 'bg-orange-500', textColor: 'text-orange-700' },
    { label: 'Hot Leads', value: 80, borderColor: 'border-red-500', bgColor: 'bg-red-500', textColor: 'text-red-700' },
    { label: 'Tenants', value: 80, borderColor: 'border-yellow-400', bgColor: 'bg-yellow-400', textColor: 'text-yellow-700' },
    { label: 'Buyers', value: 80, borderColor: 'border-slate-800', bgColor: 'bg-slate-800', textColor: 'text-slate-800' },
    { label: 'Calling to Sellers', value: 80, borderColor: 'border-blue-400', bgColor: 'bg-blue-400', textColor: 'text-blue-700' },
    { label: 'Rent Inventory', value: 80, borderColor: 'border-yellow-200', bgColor: 'bg-yellow-200', textColor: 'text-yellow-700' },
  ];
  
  return (
    <section className="flex flex-col gap-4 rounded-lg mt-4 w-full">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl text-gray-800">Overall Leads Details</h2>
        <div className="flex gap-3 text-sm text-gray-600">
          <button className="flex items-center gap-1 hover:text-cyan-600 transition">
            View All <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600 transition">
            Filter <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">
        {leadCards.map(({ label, value, borderColor, textColor, bgColor }) => (
        <div
          key={label}
          className={`flex flex-row  px-4 py-3 gap-4 rounded-3xl shadow-sm bg-white border-l-4 ${borderColor} `}
        >
          <div className="">
            <div className={`p-2 rounded-full ${bgColor}`}>
            <NotepadText size={18} className="text-white" />
          </div>
          </div>
          <div className="flex flex-col">
            <h3 className={`text-xs font-semibold mb-2 ${textColor}`}>{label}</h3>
            <p className={`text-[40px] ${textColor}`}>{value}</p>
          </div>
        </div>
      ))}
      </div>
    </section>
  );
};

export default OverallLeadsDetails;

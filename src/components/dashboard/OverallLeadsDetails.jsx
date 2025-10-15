
import { useEffect, useState } from "react";
import api from "../../api/api";
import { ChevronDown, Filter, NotepadText } from "lucide-react";

const cardConfig = [
  { label: 'Site Visit', borderColor: 'border-cyan-400', bgColor: 'bg-cyan-400', textColor: 'text-cyan-600' },
  { label: 'Calling to Buyers', borderColor: 'border-pink-400', bgColor: 'bg-pink-400', textColor: 'text-pink-600' },
  { label: 'Sale Inventory', borderColor: 'border-orange-500', bgColor: 'bg-orange-500', textColor: 'text-orange-700' },
  { label: 'Hot Leads', borderColor: 'border-red-500', bgColor: 'bg-red-500', textColor: 'text-red-700' },
  { label: 'Tenants', borderColor: 'border-yellow-400', bgColor: 'bg-yellow-400', textColor: 'text-yellow-700' },
  { label: 'Buyers', borderColor: 'border-slate-800', bgColor: 'bg-slate-800', textColor: 'text-slate-800' },
  { label: 'Calling to Sellers', borderColor: 'border-blue-400', bgColor: 'bg-blue-400', textColor: 'text-blue-700' },
  { label: 'Rent Inventory', borderColor: 'border-yellow-200', bgColor: 'bg-yellow-200', textColor: 'text-yellow-700' },
];

const OverallLeadsDetails = () => {
  const [leadData, setLeadData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/card');
        // Convert array to object for quick lookup
        const dataObj = {};
        response.data.forEach(item => {
          dataObj[item.title] = item.value;
        });
        setLeadData(dataObj);
      } catch (err) {
        setError('Failed to fetch lead details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="flex flex-col gap-4 rounded-lg mt-4 w-full">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl text-gray-800">Overall Leads Details</h2>
   
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center py-8">Loading...</div>
        ) : error ? (
          <div className="col-span-4 text-center py-8 text-red-500">{error}</div>
        ) : (
          cardConfig.map(({ label, borderColor, textColor, bgColor }) => {
            const value = leadData[label] ?? 0;
            return (
              <div
                key={label}
                className={`flex flex-row px-4 py-3 gap-4 rounded-3xl shadow-sm bg-white border-l-4 ${borderColor}`}
              >
                <div>
                  <div className={`p-2 rounded-full ${bgColor}`}>
                    <NotepadText size={18} className="text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-xs font-semibold mb-2 ${textColor}`}>{label}</h3>
                  <p className={`text-[40px] ${textColor}`}>{value}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default OverallLeadsDetails;

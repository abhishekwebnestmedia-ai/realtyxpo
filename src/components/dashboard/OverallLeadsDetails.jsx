import { useNavigate } from "react-router-dom";
import { NotepadText } from "lucide-react";
import { useDashboardCards } from "../../hooks/useDashboardCards";

const cardConfig = [
  { label: 'Site Visit', borderColor: 'border-cyan-400', bgColor: 'bg-cyan-400', textColor: 'text-cyan-600', nav: '/daily-plan' },
  { label: 'Calling to Buyers', borderColor: 'border-pink-400', bgColor: 'bg-pink-400', textColor: 'text-pink-600', nav: '/daily-plan' },
  { label: 'Sale Inventory', borderColor: 'border-orange-500', bgColor: 'bg-orange-500', textColor: 'text-orange-700', nav: '/inventory', navState: { selectedTab: 'Sales' } },
  { label: 'Hot Leads', borderColor: 'border-red-500', bgColor: 'bg-red-500', textColor: 'text-red-700', nav: '/all-leads', navState: { filterKey: 'Hot' } },
  { label: 'Tenants', borderColor: 'border-yellow-400', bgColor: 'bg-yellow-400', textColor: 'text-yellow-700', nav: '/all-leads', navState: { selectedTab: 'Rental Business' } },
  { label: 'Buyers', borderColor: 'border-slate-800', bgColor: 'bg-slate-800', textColor: 'text-slate-800', nav: '/all-leads', navState: { selectedTab: 'All Buyers' } },
  { label: 'Calling to Sellers', borderColor: 'border-blue-400', bgColor: 'bg-blue-400', textColor: 'text-blue-700', nav: '/daily-plan' },
  { label: 'Rent Inventory', borderColor: 'border-yellow-200', bgColor: 'bg-yellow-200', textColor: 'text-yellow-700', nav: '/inventory', navState: { selectedTab: 'Rent' } },
];

const OverallLeadsDetails = () => {
  const navigate = useNavigate();
  const { cardMap, isPending, isError, error } = useDashboardCards();
  const errorMessage = error?.userMessage || error?.message || "Failed to fetch lead details";

  const handleCardClick = (card) => {
    if (card.nav) {
      navigate(card.nav, { state: card.navState || {} });
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-lg mt-4 w-full">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl text-gray-800">Overall Leads Details</h2>
   
      </div>

      {/* Cards */}
      <div className="grid grid-cols-4 gap-4">
        {isPending ? (
          <div className="col-span-4 text-center py-8">Loading...</div>
        ) : isError ? (
          <div className="col-span-4 text-center py-8 text-red-500">{errorMessage}</div>
        ) : (
          cardConfig.map((card) => {
            const value = Number(cardMap[card.label] ?? 0);
            return (
              <div
                key={card.label}
                onClick={() => handleCardClick(card)}
                className={`flex flex-row px-4 py-3 gap-4 rounded-3xl shadow-sm bg-white border-l-4 ${card.borderColor} cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div>
                  <div className={`p-2 rounded-full ${card.bgColor}`}>
                    <NotepadText size={18} className="text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-xs font-semibold mb-2 ${card.textColor}`}>{card.label}</h3>
                  <p className={`text-[40px] ${card.textColor}`}>{value}</p>
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

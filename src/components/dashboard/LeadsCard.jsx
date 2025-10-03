const LeadCard = ({ title, value, color }) => (
  <div className={`p-4 rounded shadow-md flex-1 ${color}`}>
    <h4 className="font-bold">{title}</h4>
    <p className="text-2xl font-semibold">{value}</p>
  </div>
);

const OverallLeads = () => (
  <div className="flex gap-4 mt-4">
    <LeadCard title="Site Visit" value={80} color="bg-blue-100" />
    <LeadCard title="Calling to Buyers" value={80} color="bg-pink-100" />
    <LeadCard title="Sale Inventory" value={80} color="bg-orange-100" />
    <LeadCard title="Hot Leads" value={80} color="bg-red-100" />
    <LeadCard title="Tenants" value={80} color="bg-yellow-100" />
    <LeadCard title="Buyers" value={80} color="bg-indigo-100" />
    <LeadCard title="Calling to Sellers" value={80} color="bg-purple-100" />
    <LeadCard title="Rent Inventory" value={80} color="bg-orange-50" />
  </div>
);

export default OverallLeads;

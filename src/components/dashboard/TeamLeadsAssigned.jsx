import { Pencil, Trash2, ChevronDown, Filter, FileInput } from "lucide-react";

const TeamLeadsAssigned = () => {
  const data = [
    {
      name: "Sahil panchal",
      leadsAssigned: 10,
      hotLeads: 3,
      planStatus: "08/10",
      visitsToday: 5,
    },
    {
      name: "Sahil panchal",
      leadsAssigned: 10,
      hotLeads: 3,
      planStatus: "08/10",
      visitsToday: 5,
    },
    {
      name: "Sahil panchal",
      leadsAssigned: 10,
      hotLeads: 3,
      planStatus: "08/10",
      visitsToday: 5,
    },
    {
      name: "Sahil panchal",
      leadsAssigned: 10,
      hotLeads: 3,
      planStatus: "08/10",
      visitsToday: 5,
    },
    {
      name: "Sahil panchal",
      leadsAssigned: 10,
      hotLeads: 3,
      planStatus: "08/10",
      visitsToday: 5,
    },
  ];

  return (
    <section className="rounded-xl  mt-9">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl">Team Leads Assigned</h2>
        <div className="flex gap-5 text-[13px] text-gray-600 font-medium">
          <button className="flex items-center gap-1 hover:text-cyan-600">
            View All <ChevronDown size={16}/>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Filter <Filter size={16}/>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Download PDF <FileInput size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-80 overflow-y-auto overflow-hidden rounded-3xl bg-white shadow-sm min-h-[40vh]">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFBFC] text-gray-500 border-b ">
            <tr>
              <th className="text-left text-sm px-5 py-6 font-medium">Name</th>
              <th className="text-left text-sm px-5 py-6 font-medium">No. of Leads Assigned</th>
              <th className="text-left text-sm px-5 py-6 font-medium">No. of Hot Leads Assigned</th>
              <th className="text-left text-sm px-5 py-6 font-medium">Daily Plan Status</th>
              <th className="text-left text-sm px-5 py-6 font-medium">No. of visits today</th>
              <th className="text-left text-sm px-5 py-6 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="p-5">
            {data.map((row, i) => (
              <tr key={i} className="border-b last:border-none hover:bg-gray-50">
                <td className="px-5 py-3">{row.name}</td>
                <td className="px-5 py-3">{row.leadsAssigned}</td>
                <td className="px-5 py-3 text-red-500">{row.hotLeads}</td>
                <td className="px-5 py-3">
                  <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                    {row.planStatus}
                  </span>
                </td>
                <td className="px-5 py-3">{row.visitsToday}</td>
                <td className="px-5 py-3 flex items-center gap-3">
                  <Pencil size={16} className="text-green-500 cursor-pointer" />
                  <Trash2 size={16} className="text-red-500 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TeamLeadsAssigned;

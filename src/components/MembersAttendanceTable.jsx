import { ChevronDown, Filter, CheckCircle2, XCircle } from "lucide-react";

const MembersAttendanceTable = () => {
  const members = [
    {
      status: "present",
      name: "Sahil Panchpal",
      email: "Sahilpanchpal@realtypox.com",
      phone: "+91 8171839997",
    },
    {
      status: "absent",
      name: "Sahil Panchpal",
      email: "Sahilpanchpal@realtypox.com",
      phone: "+91 8171839997",
    },
    {
      status: "absent",
      name: "Sahil Panchpal",
      email: "Sahilpanchpal@realtypox.com",
      phone: "+91 8171839997",
    },
      {
      status: "absent",
      name: "Sahil Panchpal",
      email: "Sahilpanchpal@realtypox.com",
      phone: "+91 8171839997",
    },
      {
      status: "absent",
      name: "Sahil Panchpal",
      email: "Sahilpanchpal@realtypox.com",
      phone: "+91 8171839997",
    },
  ];

  const statusIcons = {
    present: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    absent: <XCircle className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className="flex flex-col rounded-2xl w-[55%] bg-[#F4F6FF] shadow-sm   ">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 ">
        <h2 className="font-semibold text-gray-800">Members Attendance</h2>
        <div className="flex gap-3 text-sm text-gray-600">
          <button className="flex items-center gap-1 hover:text-cyan-600 transition">
            View All <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600 transition">
            Filter <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white mx-[6px] rounded-2xl mb-1 ">
        <div className="overflow-x-auto scrollbar-hidden">
          <table className="w-full text-sm text-left text-gray-700 ">
            <thead className=" text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 w-16">Status</th>
                <th className="px-4 py-3 min-w-[150px]">Name</th>
                <th className="px-4 py-3 min-w-[200px]">Email</th>
                <th className="px-4 py-3 min-w-[140px]">Phone No.</th>
              </tr>
            </thead>
            <tbody>
              {members.map(({ status, name, email, phone }, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-200  hover:bg-gray-100 transition"
                >
                  <td className="px-4 py-3 self-center">{statusIcons[status]}</td>
                  <td className="px-4 py-3">{name}</td>
                  <td
                    className="px-4 py-3 truncate max-w-[200px]"
                    title={email}
                  >
                    {email}
                  </td>
                  <td
                    className="px-4 py-3 truncate max-w-[140px]"
                    title={phone}
                  >
                    {phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersAttendanceTable;

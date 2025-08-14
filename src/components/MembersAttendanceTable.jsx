const MembersAttendanceTable = () => {
  const members = [
    {
      status: 'present',
      name: 'Sahil Panchpal',
      email: 'Sahilpanchpal@realtypox.com',
      phone: '+91 8171839997',
    },
    {
      status: 'absent',
      name: 'Sahil Panchpal',
      email: 'Sahilpanchpal@realtypox.com',
      phone: '+91 8171839997',
    },
    {
      status: 'absent',
      name: 'Sahil Panchpal',
      email: 'Sahilpanchpal@realtypox.com',
      phone: '+91 8171839997',
    },
  ];

  const statusColors = {
    present: 'bg-green-400',
    absent: 'bg-red-400',
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-300 p-5 max-w-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Members Attendance</h2>
        <div className="flex gap-3 text-xs text-gray-600">
          <button className="flex items-center gap-1 hover:text-cyan-600">
            View All <span>⌄</span>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Filter <span>⚙</span>
          </button>
        </div>
      </div>
      <table className="w-full text-sm text-left text-gray-700">
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone No.</th>
          </tr>
        </thead>
        <tbody>
          {members.map(({ status, name, email, phone }, i) => (
            <tr key={i} className="border-t border-gray-300 hover:bg-gray-50">
              <td className="py-2">
                <span
                  className={`inline-block w-4 h-4 rounded-full ${statusColors[status]}`}
                  title={status}
                ></span>
              </td>
              <td className="py-2">{name}</td>
              <td className="py-2 truncate max-w-xs">{email}</td>
              <td className="py-2">{phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default MembersAttendanceTable;

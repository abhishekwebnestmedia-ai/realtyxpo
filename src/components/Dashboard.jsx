import { Doughnut } from 'react-chartjs-2';

const OverviewDashboard = () => {
  const data = {
    labels: ["Site Visit", "Calling to buyers", "Sale Inventory", "Hot Leads", "Tenants", "Buyers", "Calling to Sellers", "Rent Inventory"],
    datasets: [{
      data: [4, 4, 7, 5, 6, 6, 6, 6],
      backgroundColor: ['#33d9b2','#ff6b81','#ff9f43','#ff5252','#feca57','#1e90ff','#575fcf','#ffbe76'],
      borderWidth: 0
    }]
  };

  return (
    <div className="bg-white p-4 rounded shadow-md flex justify-between">
      <div className="flex flex-col items-center justify-center">
        <Doughnut data={data} />
        <span className="text-2xl font-bold mt-2">29</span>
        <span>Total Leads</span>
      </div>
      <div className="ml-8 flex-1">
        <h3 className="font-bold mb-2">Members Attendance</h3>
        {/* Replace with table */}
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Status</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🟢</td>
              <td>Sahil Panchpal</td>
              <td>sahil@example.com</td>
              <td>+91 8171839997</td>
            </tr>
            <tr>
              <td>🔴</td>
              <td>Sahil Panchpal</td>
              <td>sahil@example.com</td>
              <td>+91 8171839997</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

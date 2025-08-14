import React from 'react'

const Header = () => (
  <div className="flex justify-between items-center p-4 bg-white shadow-md">
    <h2 className="font-bold text-lg">Welcome Sahil</h2>
    <div className="flex items-center gap-4">
      <button className="p-2 rounded hover:bg-gray-100">Assign Lead +</button>
      <button className="p-2 rounded hover:bg-gray-100">Add Bulk Lead</button>
      <button className="p-2 rounded hover:bg-gray-100">Add Lead</button>
      <img
        src="https://via.placeholder.com/32"
        alt="profile"
        className="rounded-full"
      />
    </div>
  </div>
);


export default Header

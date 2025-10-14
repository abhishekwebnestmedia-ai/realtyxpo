import React from 'react'
import { Bell } from 'lucide-react';

const Header = () => (
  <div className="flex justify-between items-center bg-white shadow-md drop-shadow-sm transition-all duration-300">
    <h2 className="font-bold text-lg">Welcome Sahil</h2>
  <div className="flex items-center gap-4">
      <button className="p-2 rounded hover:bg-gray-100 transition-all duration-200">Assign Lead +</button>
      <button className="p-2 rounded hover:bg-gray-100 transition-all duration-200">Add Bulk Lead</button>
      <button className="p-2 rounded hover:bg-gray-100 transition-all duration-200">Add Lead</button>
  <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
      <img
        src="https://via.placeholder.com/32"
        alt="profile"
        className="rounded-full"
      />
    </div>
  </div>
);


export default Header

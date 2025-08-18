import { Bell, ChevronDown } from "lucide-react";
import { useState } from "react";
import { PanelsTopLeft, Radio } from "lucide-react";
const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex justify-between items-center px-5 py-[6px] bg-white shadow sticky top-0 z-50 ">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="">
          <PanelsTopLeft size={24} color="black" />
        </div>
        <div>
          <p className="text-lg font-medium">Welcome Sahil</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="p-2 bg-white rounded-full border border-[#666E99]">
          <Bell className="w-6 h-6 cursor-pointer text-gray-600" />
        </div>
        <div className="p-2 bg-white rounded-full border border-[#666E99]">
          <Radio size={24} />
        </div>

        {/* Profile section */}
        <div className="relative">
          <button
            className="flex items-center space-x-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="w-10 h-10 rounded-full border"
            />
            <div className="flex flex-col">
              <span className="font-medium">Sahil Panchal</span>
              <span className="font-medium truncate w-32">
                Shashankpanchal20@gmail.com
              </span>
            </div>
            <ChevronDown size={18} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border">
              <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                View Profile
              </div>
              <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                Settings
              </div>
              <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

import { Bell, ChevronDown, PanelsTopLeft, Radio } from "lucide-react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
const TopBar = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears token and user
    navigate("/login"); // Redirect to login page
  };

  return (
    <header className="flex justify-between items-center px-5 py-[6px] bg-white sticky top-0 z-50">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="cursor-pointer " onClick={toggleSidebar}>
          <PanelsTopLeft size={24} color="black" className="object-contain" />
        </div>
        <div>
          <p className="text-lg font-medium">Welcome {user.name}</p>
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
            {/* <img
              src=""
              alt="Profile"
              className="w-10 h-10 rounded-full border"
            /> */}
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="font-medium truncate w-32">
                {user.email}
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
              <button
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

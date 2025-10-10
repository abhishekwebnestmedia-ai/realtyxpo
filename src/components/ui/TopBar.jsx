import { Bell, ChevronDown, PanelsTopLeft, Radio } from "lucide-react";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const TopBar = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout(); // Clears token and user
    navigate("/login"); // Redirect to login page
  };

  const handleViewProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  const handleEditProfile = () => {
    setIsOpen(false);
    navigate("/profile/edit");
  };

  const handleBroadcastClick = () => {
    navigate("/broadcast");
  };

  // Function to get user initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <div 
          className="p-2 bg-white rounded-full border border-[#666E99] cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleBroadcastClick}
        >
          <Radio size={24} className="text-gray-600" />
        </div>

        {/* Profile section */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-3"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Profile Circle */}
            <div className="flex items-center space-x-3">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-sm font-bold text-white">
                    {getInitials(user?.name)}
                  </span>
                </div>
              )}
              
              <div className="flex flex-col text-left">
                <span className="font-medium text-gray-900">{user?.name}</span>
                <span className="text-sm text-gray-600 truncate w-32">
                  {user?.email}
                </span>
              </div>
            </div>
            <ChevronDown size={18} className="text-gray-600" />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded-t-lg transition-colors"
                onClick={handleViewProfile}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
              <div className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
                Settings
              </div>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded-b-lg transition-colors"
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

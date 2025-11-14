import { Bell, ChevronDown, PanelsTopLeft, Radio } from "lucide-react";
import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNotifications } from '../../hooks/useNotifications';
import NotificationsPanel from './NotificationsPanel';

const TopBar = ({ toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { unreadCount, openPanel, closePanel, isPanelOpen, isRinging } = useNotifications();

  const handleLogout = () => {
    // Open confirmation modal instead of immediate logout
    setShowLogoutModal(true);
    setIsOpen(false);
  };

  const confirmLogout = async () => {
    try {
      await logout(); // Clears token and user
    } catch (err) {
      // ignore - logout should clear client state anyway
    } finally {
      setShowLogoutModal(false);
      navigate("/login"); // Redirect to login page
    }
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

  // Build full image URL for relative paths returned by the API
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `https://backend.realtyxpo.in${imagePath}`;
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

  // Compute profile image src (supports multiple possible field names)
  const profileSrc = getImageUrl(user?.profileImage || user?.profilePicture || user?.avatar || user?.profilePhoto);

  return (
    <>
    <header className="flex justify-between items-center px-5 py-[6px] bg-white sticky top-0 z-50 transition-all duration-300 border-b border-gray-200">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <div className="cursor-pointer" onClick={toggleSidebar}>
          <PanelsTopLeft size={24} color="black" className="object-contain" />
        </div>
        <div>
          <p className="text-lg font-medium">Welcome {user?.name}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => (isPanelOpen ? closePanel() : openPanel())}
            className="p-2 bg-white rounded-full border border-[#666E99] relative"
            aria-label="Open notifications"
          >
            <Bell className={`w-6 h-6 cursor-pointer ${isRinging ? 'text-red-600 animate-bounce' : 'text-gray-600'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1.5">{unreadCount}</span>
            )}
          </button>
          
          <NotificationsPanel />
        </div>
        <div 
          className="p-2 bg-white rounded-full border border-[#666E99] cursor-pointer hover:bg-gray-50"
          onClick={handleBroadcastClick}
        >
          <Radio size={24} className="text-gray-600" />
        </div>

        {/* Profile section */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-3 transition-all duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            {/* Profile Circle */}
            <div className="flex items-center space-x-3">
              {profileSrc ? (
                <img
                  src={profileSrc}
                  alt="Profile"
                  onError={(e) => { e.target.style.display = 'none'; }}
                  className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover transition-all duration-300 hover:scale-105 focus:scale-105"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-200 transition-all duration-300 hover:scale-105 focus:scale-105">
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
            <ChevronDown size={18} className="text-gray-600 transition-all duration-200 group-hover:rotate-180" />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 transition-all duration-300">
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded-t-lg transition-all duration-200"
                onClick={handleViewProfile}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
              {/* Settings removed as per request */}
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer rounded-b-lg transition-all duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    {showLogoutModal && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setShowLogoutModal(false)}
        />

        <div className="relative w-full max-w-md mx-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500">
              <h3 className="text-white text-lg font-semibold">Confirm Logout</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to logout? You will be returned to the login screen.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default TopBar;

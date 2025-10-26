import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import { User, Mail, Phone, Calendar, MapPin, Building, Clock, Loader2 } from "lucide-react";

// User version of UserDetails - limited editing capabilities
const UserUserDetails = ({ selectedUserId, onBack }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUserId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/auth/user/${selectedUserId}`);
        setUserDetails(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [selectedUserId]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://backend.realtyxpo.in${imagePath}`;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading User</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-500 mb-4">The requested user details could not be found.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profileSrc = getImageUrl(
    userDetails.profileImage || 
    userDetails.profilePicture || 
    userDetails.avatar || 
    userDetails.profilePhoto
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {profileSrc ? (
                <img
                  src={profileSrc}
                  alt={userDetails.name || "Profile"}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-2xl font-bold shadow-lg">
                  {getInitials(userDetails.name || userDetails.username || userDetails.email)}
                </div>
              )}
            </div>
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">
                {userDetails.name || userDetails.username || "Unknown User"}
              </h1>
              <p className="text-blue-100 text-lg">
                {userDetails.designation || userDetails.role || "Team Member"}
              </p>
              <div className="flex items-center mt-2 text-blue-100">
                <Building className="h-4 w-4 mr-2" />
                <span>{userDetails.department || "Real Estate Team"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              {userDetails.email && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{userDetails.email}</p>
                  </div>
                </div>
              )}

              {userDetails.phone && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{userDetails.phone}</p>
                  </div>
                </div>
              )}

              {userDetails.location && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Location</p>
                    <p className="text-gray-900">{userDetails.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Details</h2>
              
              {userDetails.employeeId && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Employee ID</p>
                    <p className="text-gray-900">{userDetails.employeeId}</p>
                  </div>
                </div>
              )}

              {userDetails.joinDate && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Join Date</p>
                    <p className="text-gray-900">
                      {new Date(userDetails.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {userDetails.status && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userDetails.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userDetails.status}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {userDetails.bio && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{userDetails.bio}</p>
            </div>
          )}

          {/* Skills or Specializations */}
          {userDetails.skills && userDetails.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {userDetails.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity - Read-only for users */}
          {userDetails.lastActive && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Active</p>
                  <p className="text-gray-900">
                    {new Date(userDetails.lastActive).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserUserDetails;
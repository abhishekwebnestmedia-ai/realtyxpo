import React, { useRef, useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import icon1 from "/menuicons/1.svg";
import icon2 from "/menuicons/2.svg";
import icon3 from "/menuicons/3.svg";
import icon4 from "/menuicons/4.svg";
import icon5 from "/menuicons/5.svg";
import icon6 from "/menuicons/6.svg";
import icon7 from "/menuicons/7.svg";
import icon8 from "/menuicons/8.svg";


import icon9 from "/menuicons/9.svg";
import icon10 from "/menuicons/10.svg";
import { AuthContext } from "../../context/AuthContext";
import { getViewerPerms, hasAnyLeadAccess, hasAnyInventoryAccess } from '../../utils/permissions';

const SidebarMenu = ({ isOpen }) => {
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [indicatorHeight, setIndicatorHeight] = useState(0);
  const itemRefs = useRef([]);
  const menuItems = [
    { icon: icon9, text: "Dashboard", path: "/" },
    { icon: icon1, text: "Daily Plan", path: "/daily-plan" },
    { icon: icon2, text: "All Leads", path: "/all-leads" },
    { icon: icon3, text: "Inventory", path: "/inventory" },
    { icon: icon4, text: "Projects Working", path: "/projects-working" },
    {
      icon: icon5,
      text: "Brokers Requirements",
      path: "/brokers-requirements",
    },
    { icon: icon6, text: "My Team", path: "/my-team" },
    // { icon: icon7, text: "Find Opportunity", path: "/find-opportunity" },
  { icon: icon8, text: "Learn Grow", path: "/learn-grow" },
  { icon: icon10, text: "Database", path: "/database" },
  ];

  // permission-aware filtering
  const { user } = useContext(AuthContext) || {};
  const vp = getViewerPerms(user || {});
  const visibleItems = menuItems.filter(item => {
    switch (item.text) {
      case 'Dashboard':
        return Boolean(vp.dashboard);
      case 'Daily Plan':
        return Boolean(vp.dailyPlans);
      case 'All Leads':
        return hasAnyLeadAccess(vp);
      case 'Inventory':
        return hasAnyInventoryAccess(vp);
      case 'Projects Working':
        return Boolean(vp.projectsWorking);
      case 'Brokers Requirements':
        return Boolean(vp.brokersRequirements);
      case 'My Team':
        return Boolean(vp.myTeam);
      case 'Find Opportunity':
        return Boolean(vp.findOpportunity);
      case 'Learn Grow':
        return Boolean(vp.learnGrow);
      case 'Database':
        return Boolean(vp.dataBase);
      default:
        return true;
    }
  });

  // Get current path for active tab highlighting (reactive)
  const location = useLocation();
  const currentPath = location.pathname;

  // Animate indicator position when active tab changes
  useEffect(() => {
    const activeIndex = visibleItems.findIndex(item => item.path === currentPath);
    const activeRef = itemRefs.current[activeIndex];
    if (activeRef) {
      const { offsetTop, offsetHeight } = activeRef;
      setIndicatorTop(offsetTop);
      setIndicatorHeight(offsetHeight);
    } else {
      setIndicatorTop(0);
      setIndicatorHeight(0);
    }
  }, [currentPath, isOpen, visibleItems]);

  return (
    <div className="relative flex flex-col h-full py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
      {/* Logo toggles sidebar */}
      <div
        className="flex justify-center overflow-hidden cursor-pointer border-slate-700"
        style={{
          transition:
            "width 0.3s ease, height 0.3s ease, margin-left 0.3s ease",
          width: isOpen ? "11rem" : "2.5rem",
          height: "2.5rem",
          marginLeft: isOpen ? "20px" : "5px",
        }}
      >
        <img
          src={isOpen ? "/logo-white.svg" : "/fav-icon.svg"}
          alt="Logo"
          style={{
            width: isOpen ? "11rem" : "2.5rem",
            height: "2.5rem",
            objectFit: "contain",
            transition: "opacity 0.3s ease",
          }}
        />
      </div>

      {/* Menu Items */}
      <div className="mt-6 relative flex flex-col gap-y-2">
        {/* Animated indicator */}
        <span
          style={{
            position: "absolute",
            left: 0,
            top: indicatorTop,
            height: indicatorHeight,
            width: "7px",
            background: "#6F84FA",
            borderRadius: "0 1rem 1rem 0",
            transition:
              "top 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1)",
            zIndex: 1,
          }}
        />
        {visibleItems.map((item, index) => {
          const isActive = currentPath === item.path;
          // don't log here in production
          return (
            <Link
              key={index}
              to={item.path}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`relative flex items-center py-2 transition-colors duration-300  group hover:bg-slate-700${
                isActive ? " bg-slate-700" : ""
              }`}
              style={{ overflow: "visible" }}
            >
              <span
                className="flex items-center justify-center flex-shrink-0 w-12"
                style={{ zIndex: 2 }}
              >
                <img src={item.icon} alt={item.text} className="w-6 h-6" />
              </span>
              {/* Tooltip when sidebar is closed: shows on hover */}
              {!isOpen && (
                <span className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                  {item.text}
                </span>
              )}
              <span
                className="overflow-hidden text-xl transition-all duration-300 whitespace-nowrap"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transitionProperty: "opacity, max-width, margin-left",
                  zIndex: 2,
                }}
              >
                {item.text}
              </span>
            </Link>
          );
        })}
      </div>
      <div
        className="flex justify-center absolute bottom-3 overflow-hidden cursor-pointer border-slate-700"
        style={{
          transition:
            "width 0.3s ease, height 0.3s ease, margin-left 0.3s ease",
          width: isOpen ? "11rem" : "2.5rem",
          height: "2.5rem",
          marginLeft: isOpen ? "20px" : "5px",
        }}
      >
      <a href="https://webnestmedia.in/" target="_blank" rel="noopener noreferrer">
          <img
          src={isOpen ? "/webnest-logo-full.svg" : "/webnst-logo.svg"}
          alt="Logo"
          style={{
            width: isOpen ? "11rem" : "2rem",
            height: "2.5rem",
            objectFit: "contain",
            transition: "opacity 0.3s ease",
          }}
        />
      </a>
      </div>
    </div>
  );
};

export default SidebarMenu;

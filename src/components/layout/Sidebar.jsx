import React from "react";
import { Link } from "react-router-dom";
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
const SidebarMenu = ({ isOpen}) => {
  const menuItems = [
    { icon: icon9, text: "Dashboard", path: "/" },
    { icon: icon1, text: "Daily Plan", path: "/daily-plan" },
    { icon: icon2, text: "All Leads", path: "/all-leads" },
    { icon: icon3, text: "Inventory", path: "/inventory" },
    { icon: icon4, text: "Projects Working", path: "/projects-working" },
    { icon: icon5, text: "Brokers Requirements", path: "/brokers-requirements" },
    { icon: icon6, text: "My Team", path: "/my-team" },
    { icon: icon7, text: "Find Opportunity", path: "/find-opportunity" },
    { icon: icon8, text: "Learn Grow", path: "/learn-grow" },
    { icon: icon10, text: "Database", path: "/learn-grow" }
  ];

  return (
    <nav className="relative flex flex-col h-full py-4">
      {/* Logo toggles sidebar */}
      <div
        className="flex justify-center overflow-hidden cursor-pointer border-slate-700"
        
        style={{
          transition: "width 0.3s ease, height 0.3s ease, margin-left 0.3s ease",
          width: isOpen ? "11rem" : "2.5rem",
          height: "2.5rem",
          marginLeft: isOpen ? "20px" : "10px"
        }}
      >
        <img
          src={isOpen ? "/logo-white.svg" : "/fav-icon.svg"}
          alt="Logo"
          style={{
            width: isOpen ? "11rem" : "2.5rem",
            height: "2.5rem",
            objectFit: "contain",
            transition: "opacity 0.3s ease"
          }}
        />
      </div>

      {/* Menu Items */}
      <div className="mx-2 mt-6 ">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            
            className="flex items-center py-3 transition-colors duration-300 rounded-lg group hover:bg-slate-700"
            style={{ overflow: "hidden" }}
          >
            <span className="flex items-center justify-center flex-shrink-0 w-12">
              <img src={item.icon} alt={item.text} className="w-6 h-6" />
            </span>
            <span
              className="overflow-hidden text-xl transition-all duration-300 whitespace-nowrap"
              style={{
                opacity: isOpen ? 1 : 0,
                
                
                transitionProperty: "opacity, max-width, margin-left"
              }}
            >
              {item.text}
            </span>
          </Link>
        ))}
      </div>
      <div
        className="flex justify-center absolute bottom-3 overflow-hidden cursor-pointer border-slate-700"
        
        style={{
          transition: "width 0.3s ease, height 0.3s ease, margin-left 0.3s ease",
          width: isOpen ? "11rem" : "2.5rem",
          height: "2.5rem",
          marginLeft: isOpen ? "20px" : "10px"
        }}
      >
        <img
          src={isOpen ? "/webnest-logo-full.svg" : "/public/webnst-logo.svg"}
          alt="Logo"
          style={{
            width: isOpen ? "11rem" : "2rem",
            height: "2.5rem",
            objectFit: "contain",
            transition: "opacity 0.3s ease"
          }}
        />
      </div>
    </nav>
  );
};

export default SidebarMenu;

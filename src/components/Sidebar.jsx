import React from "react";
import { Link } from "react-router-dom";
import icon1 from "../../public/menuicons/1.svg";
import icon2 from "../../public/menuicons/2.svg";
import icon3 from "../../public/menuicons/3.svg";
import icon4 from "../../public/menuicons/4.svg";
import icon5 from "../../public/menuicons/5.svg";
import icon6 from "../../public/menuicons/6.svg";
import icon7 from "../../public/menuicons/7.svg";
import icon8 from "../../public/menuicons/8.svg";
import icon9 from "../../public/menuicons/9.svg";

const SidebarMenu = ({ isOpen, toggleSidebar, setSidebarOpen }) => {
  const menuItems = [
    { icon: icon9, text: "Dashboard", path: "/" },
    { icon: icon1, text: "Daily Plan", path: "/daily-plan" },
    { icon: icon2, text: "All Leads", path: "/all-leads" },
    { icon: icon3, text: "Inventory", path: "/inventory" },
    { icon: icon4, text: "Projects Working", path: "/projects-working" },
    { icon: icon5, text: "Brokers Requirements", path: "/brokers-requirements" },
    { icon: icon6, text: "My Team", path: "/my-team" },
    { icon: icon7, text: "Find Opportunity", path: "/find-opportunity" },
    { icon: icon8, text: "Learn Grow", path: "/learn-grow" }
  ];

  return (
    <nav className="flex flex-col py-4 space-y-2 relative h-full gap-4">
      {/* Logo toggles sidebar */}
      <div
        className="flex justify-center border-slate-700 cursor-pointer overflow-hidden"
        
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
      <div>
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            
            className="group flex items-center rounded-lg hover:bg-slate-700 py-3 transition-colors duration-300"
            style={{ overflow: "hidden" }}
          >
            <span className="flex justify-center items-center w-12 flex-shrink-0">
              <img src={item.icon} alt={item.text} className="w-6 h-6" />
            </span>
            <span
              className="transition-all text-xl duration-300 whitespace-nowrap overflow-hidden"
              style={{
                opacity: isOpen ? 1 : 0,
                maxWidth: isOpen ? "200px" : "0px",
                marginLeft: isOpen ? "8px" : "0px",
                transitionProperty: "opacity, max-width, margin-left"
              }}
            >
              {item.text}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default SidebarMenu;

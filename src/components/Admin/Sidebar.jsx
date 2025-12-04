import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdQuiz,
  MdCalendarToday,
  MdNoteAlt,
  MdDescription,
  MdAssignment,
  MdExitToApp,
  MdMenu,
} from "react-icons/md";
import Logo from "../../assets/ExamPortal_Logo.png";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
    },
    {
      id: "/about-exams",
      name: "About Exam",
      icon: <MdQuiz className="w-5 h-5" />,
    },
    {
      id: "/important-dates",
      name: "Important Dates",
      icon: <MdCalendarToday className="w-5 h-5" />,
    },
    {
      id: "/banners",
      name: "Banners",
      icon: <MdCalendarToday className="w-5 h-5" />,
    },
    {
      id: "/notes",
      name: "Notes",
      icon: <MdNoteAlt className="w-5 h-5" />,
    },
    {
      id: "/old-papers",
      name: "Old Que Papers",
      icon: <MdDescription className="w-5 h-5" />,
    },
    {
      id: "/sample-papers",
      name: "Sample Papers",
      icon: <MdAssignment className="w-5 h-5" />,
    },
  ];

  // Keep sidebar active state in sync with the current URL
  useEffect(() => {
    const path = location.pathname || "/";
    if (path === "/") {
      setActiveItem("dashboard");
      return;
    }
    if (path.startsWith("/about-exams")) {
      setActiveItem("/about-exams");
      return;
    }
    // For any other admin routes with absolute paths present in navigationItems
    const absoluteItem = navigationItems.find(
      (n) =>
        typeof n.id === "string" &&
        n.id.startsWith("/") &&
        path.startsWith(n.id)
    );
    if (absoluteItem) setActiveItem(absoluteItem.id);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg text-purple-600 hover:bg-gray-50 transition-colors duration-200"
      >
        <MdMenu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-60 flex flex-col py-6 shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
        style={{
          background: "linear-gradient(to bottom, #5B4FD1, #4C3FB8, #3D2F9F)",
        }}
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src={Logo}
            alt="ExamPortal Logo"
            className="w-25 h-25 rounded-xl object-contain shadow-lg"
          />
        </div>

        {/* Grey HR line */}
        <div className="mx-4 mb-6 border-t border-gray-300 border-opacity-30"></div>

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-2 flex-1 px-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveItem(item.id);
                setIsSidebarOpen(false); // Close sidebar on navigation click
                if (item.id === "dashboard") {
                  navigate("/");
                } else if (
                  typeof item.id === "string" &&
                  item.id.startsWith("/")
                ) {
                  navigate(item.id);
                }
              }}
              className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group w-full text-left
              ${
                activeItem === item.id
                  ? "bg-indigo-300/20 ring-1 ring-indigo-200/30 text-white shadow-sm backdrop-blur-sm"
                  : "text-white/80 hover:bg-indigo-300/10 hover:ring-1 hover:ring-indigo-200/20 hover:text-white hover:backdrop-blur-sm"
              }
            `}
            >
              <div
                className={`
              transition-colors duration-200
              ${
                activeItem === item.id
                  ? "text-white"
                  : "text-white/80 group-hover:text-white"
              }
            `}
              >
                {item.icon}
              </div>
              <span
                className={`
              text-base font-medium transition-colors duration-300 ease-in-out
              ${
                activeItem === item.id
                  ? "text-white"
                  : "text-white/80 group-hover:text-white"
              }
            `}
              >
                {item.name}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom Profile/Logout */}
        <div className="mt-auto px-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out group w-full text-left text-white/80 hover:bg-indigo-300/10 hover:ring-1 hover:ring-indigo-200/20 hover:text-white hover:backdrop-blur-sm"
          >
            <MdExitToApp className="w-5 h-5 text-white/80 group-hover:text-white transition-colors duration-300 ease-in-out" />
            <span className="text-base font-medium text-white/80 group-hover:text-white transition-colors duration-300 ease-in-out">
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

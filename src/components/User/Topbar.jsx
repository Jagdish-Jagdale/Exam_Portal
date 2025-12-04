import React, { useState } from 'react';
import { 
  MdDashboard,
  MdQuiz,
  MdCalendarToday,
  MdNoteAlt,
  MdDescription,
  MdAssignment,
  MdLogout
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext.jsx';
import Logo from '../../assets/ExamPortal_Logo.png';

const Topbar = () => {
  const { logout } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <MdDashboard className="w-5 h-5" /> },
    { id: 'about-exam', name: 'About Exam', icon: <MdQuiz className="w-5 h-5" /> },
    { id: 'important-dates', name: 'Important Dates', icon: <MdCalendarToday className="w-5 h-5" /> },
    { id: 'notes', name: 'Notes', icon: <MdNoteAlt className="w-5 h-5" /> },
    { id: 'old-papers', name: 'Old Que Papers', icon: <MdDescription className="w-5 h-5" /> },
    { id: 'sample-papers', name: 'Sample Papers', icon: <MdAssignment className="w-5 h-5" /> }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src={Logo} alt="ExamPortal Logo" className="w-8 h-8 rounded-md object-contain" />
            <span className="font-semibold text-gray-800">Exam Portal</span>
          </div>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`
                  inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                  ${activeItem === item.id
                    ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                    : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
            >
              <MdLogout className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
      {/* Divider */}
      <div className="border-t border-gray-200" />
    </header>
  );
};

export default Topbar;

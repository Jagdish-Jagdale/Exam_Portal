import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { MdDashboard, MdQuiz, MdCalendarToday, MdNoteAlt, MdDescription, MdAssignment, MdAccountCircle } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext.jsx';
import UserLogo from '../../assets/Exam Portal User.png';

const UdemyNavbar = () => {
  const { user, logout } = useAuth();
  const [elevated, setElevated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 2);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigationItems = [
    { id: 'dashboard', path: '/dashboard', name: 'Dashboard', icon: <MdDashboard className="w-5 h-5" /> },
    { id: 'about-exam', path: '/dashboard/about-exam', name: 'About Exam', icon: <MdQuiz className="w-5 h-5" /> },
    { id: 'important-dates', path: '/dashboard/important-dates', name: 'Important Dates', icon: <MdCalendarToday className="w-5 h-5" /> },
    { id: 'notes', path: '/dashboard/notes', name: 'Notes', icon: <MdNoteAlt className="w-5 h-5" /> },
    { id: 'old-papers', path: '/dashboard/old-papers', name: 'Old Que Papers', icon: <MdDescription className="w-5 h-5" /> },
    { id: 'sample-papers', path: '/dashboard/sample-papers', name: 'Sample Papers', icon: <MdAssignment className="w-5 h-5" /> }
  ];

  return (
    <header className={
      `sticky top-0 z-50 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${
        elevated ? 'shadow-sm ring-1 ring-black/5' : ''
      }`
    }>
      {/* Top row: logo + search + auth */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center gap-3 sm:gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
              <img src={UserLogo} alt="Exam Portal User Logo" className="w-15 h-20 rounded object-contain mr-3 my-7" />
              <span className="hidden sm:inline font-semibold text-2xl text-gray-800">Exam Portal</span>
            </Link>

            {/* search */}

            <div className="flex-1 max-w-2xl mx-1 sm:mx-2">
              <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search exams, notes, papers..."
                  className="w-full h-12 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm placeholder:text-gray-400 transition-all focus:outline-none focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 group-hover:bg-white"
                />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {user && (
                <button
                  onClick={() => navigate('/dashboard/profile')}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-700"
                  title="Profile"
                >
                  <MdAccountCircle className="w-7 h-7" />
                </button>
              )}
              {user ? (
                <button
                  onClick={logout}
                  className="text-sm px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-sm px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: navigation items */}
      <div className="border-b bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="h-12 -mb-px flex items-center gap-1 overflow-x-auto text-base text-gray-700">
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  shrink-0 inline-flex items-center gap-2 px-3 py-2 transition-colors border-b-2
                  ${isActive ? 'text-gray-900 border-indigo-600 font-medium' : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'}
                `}
                end={item.path === '/dashboard'}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default UdemyNavbar;

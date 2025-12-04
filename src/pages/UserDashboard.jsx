import React from 'react';
import { Outlet } from 'react-router-dom';
import UdemyNavbar from '../components/User/UdemyNavbar.jsx';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UdemyNavbar />
      <main className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
        <Outlet />
      </main>
    </div>
  );
};

export default UserDashboard;

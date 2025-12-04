import React from 'react';
import Sidebar from './components/Admin/Sidebar';
import './App.css';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji',
      }}
    >
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:ml-64">
        <div className="mt-16 lg:mt-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;
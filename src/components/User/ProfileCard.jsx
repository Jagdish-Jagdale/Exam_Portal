import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const ProfileCard = () => {
  const { user, profile } = useAuth();
  if (!user) return null;

  const name = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'User';
  const email = user.email || profile?.email || '';
  const role = profile?.role || 'user';

  const initial = (name || 'U').charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-semibold">
          {initial}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
          <p className="text-gray-600">{email}</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            {role}
          </div>
        </div>
      </div>
      <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-100 p-4">
          <p className="text-sm text-gray-500">UID</p>
          <p className="font-medium text-gray-800 break-all">{user.uid}</p>
        </div>
        <div className="rounded-lg border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Provider</p>
          <p className="font-medium text-gray-800">{user.providerData?.[0]?.providerId || 'password'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;

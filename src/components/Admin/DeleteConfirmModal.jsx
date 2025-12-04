import React from 'react';
import { MdClose } from 'react-icons/md';

const DeleteConfirmModal = ({
  open,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md md:max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 rounded-t-2xl">
          <h2 className="text-base md:text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white/60"
            aria-label="Close"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">
          <p className="text-gray-700 leading-6 break-words" style={{ overflowWrap: 'anywhere' }}>
            {message}
          </p>
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              disabled={loading}
            >
              {loading ? 'Deleting...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

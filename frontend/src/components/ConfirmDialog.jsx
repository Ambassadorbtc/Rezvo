import { useState } from 'react';
import { Button } from './ui/button';

// Global confirmation state
let confirmResolve = null;
let setConfirmState = null;

export function useConfirmDialog() {
  const [state, setState] = useState({ open: false, title: '', message: '' });
  setConfirmState = setState;

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      confirmResolve = resolve;
      setState({ open: true, title, message });
    });
  };

  const handleConfirm = () => {
    setState({ open: false, title: '', message: '' });
    if (confirmResolve) confirmResolve(true);
  };

  const handleCancel = () => {
    setState({ open: false, title: '', message: '' });
    if (confirmResolve) confirmResolve(false);
  };

  return { state, confirm, handleConfirm, handleCancel };
}

export function ConfirmDialog({ state, onConfirm, onCancel }) {
  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-navy-900">{state.title || 'Confirm Action'}</h3>
          </div>
        </div>
        <p className="text-navy-600 mb-6">{state.message}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

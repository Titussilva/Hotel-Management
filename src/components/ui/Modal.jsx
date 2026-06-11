import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm:  'max-w-sm',
    md:  'max-w-lg',
    lg:  'max-w-2xl',
    xl:  'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

import React from 'react';
import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#17211f',
          color: '#fff',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          maxWidth: '380px',
        },
        success: {
          iconTheme: { primary: '#4ade80', secondary: '#17211f' },
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#17211f' },
        },
      }}
    />
  );
}

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const bgColor = isSuccess ? '#ecfdf5' : isError ? '#fef2f2' : '#f5f3ff';
  const borderColor = isSuccess ? '#a7f3d0' : isError ? '#fecaca' : '#ddd6fe';
  const textColor = isSuccess ? '#065f46' : isError ? '#991b1b' : '#4338ca';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -25, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          maxWidth: '420px',
          width: 'calc(100% - 3rem)',
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <div style={{ marginTop: '2px', flexShrink: 0 }}>
          {isSuccess && <CheckCircle2 size={20} color="#10b981" />}
          {isError && <AlertCircle size={20} color="#ef4444" />}
          {!isSuccess && !isError && <Info size={20} color="#6366f1" />}
        </div>

        <div style={{ flex: 1, fontSize: '0.88rem', color: textColor, lineHeight: 1.45 }}>
          {toast.title && <div style={{ fontWeight: 700, marginBottom: '2px' }}>{toast.title}</div>}
          <div>{toast.message}</div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: textColor,
            cursor: 'pointer',
            padding: '2px',
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}


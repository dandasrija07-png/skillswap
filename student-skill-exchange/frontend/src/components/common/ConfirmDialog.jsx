import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, HelpCircle, X, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // 'primary', 'danger', 'success'
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const isSuccess = variant === 'success';

  const confirmBtnStyle = isDanger
    ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff' }
    : isSuccess
    ? { background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' }
    : { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff' };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={isLoading ? undefined : onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2 }}
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(221, 214, 254, 0.8)',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X */}
          {!isLoading && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '0.4rem',
              }}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          )}

          {/* Icon Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: isDanger ? '#fef2f2' : isSuccess ? '#ecfdf5' : '#ede9fe',
                color: isDanger ? '#ef4444' : isSuccess ? '#10b981' : '#6366f1',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              {isDanger && <AlertTriangle size={26} />}
              {isSuccess && <CheckCircle2 size={26} />}
              {!isDanger && !isSuccess && <HelpCircle size={26} />}
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="btn-secondary"
              style={{ flex: 1, padding: '0.7rem' }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="btn-primary"
              style={{ flex: 1.2, padding: '0.7rem', ...confirmBtnStyle }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


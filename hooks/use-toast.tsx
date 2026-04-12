'use client';

import React, { useCallback } from 'react';
import toastHot from 'react-hot-toast';

type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

/** Matches previous API; uses react-hot-toast (root `app/layout.tsx` mounts `<Toaster />`). */
export interface ToastMessage {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
  /** Duration in ms (default 3000) */
  duration?: number;
  id?: string;
}

const buildToastContent = (title?: React.ReactNode, description?: React.ReactNode) => {
  if (!title && !description) return null;

  return (
    <div className='flex flex-col gap-1 text-left'>
      {title ? <p className='text-sm font-semibold text-[#1F3B29]'>{title}</p> : null}
      {description ? <p className='text-sm font-normal text-slate-600'>{description}</p> : null}
    </div>
  );
};

const showToastInternal = (payload: ToastMessage = {}) => {
  const { title, description, variant = 'default', duration = 3000, id } = payload;

  const content = buildToastContent(title, description) ?? title ?? description ?? '';
  const opts = { duration, id };

  if (variant === 'success') {
    return toastHot.success(content, opts);
  }
  if (variant === 'destructive') {
    return toastHot.error(content, opts);
  }
  if (variant === 'warning') {
    return toastHot(content, { ...opts, icon: '⚠️' });
  }
  if (variant === 'info') {
    return toastHot(content, { ...opts, icon: 'ℹ️' });
  }
  return toastHot(content, opts);
};

const dismissToastInternal = (toastId?: string) => {
  if (toastId) toastHot.dismiss(toastId);
  else toastHot.dismiss();
};

function useToastMessage() {
  const showToast = useCallback((payload?: ToastMessage) => showToastInternal(payload), []);

  const showSuccess = useCallback(
    (payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'success' }),
    [showToast]
  );
  const showError = useCallback(
    (payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'destructive' }),
    [showToast]
  );
  const showInfo = useCallback(
    (payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'info' }),
    [showToast]
  );
  const showWarning = useCallback(
    (payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'warning' }),
    [showToast]
  );

  const dismiss = useCallback((toastId?: string) => dismissToastInternal(toastId), []);

  return {
    toast: showToast,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismiss,
  };
}

const toast = (payload?: ToastMessage) => showToastInternal(payload);

export { useToastMessage, useToastMessage as useToast, toast };

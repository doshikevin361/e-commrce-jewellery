'use client';

import React, { useCallback } from 'react';
import { Id, ToastContent, ToastOptions, TypeOptions, toast as toastify } from 'react-toastify';

type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

export interface ToastMessage extends ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: ToastVariant;
}

const defaultToastOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 3000, // <-- ALWAYS auto close after 3 sec
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: false, // <-- keeps the 3 second timer running
  pauseOnFocusLoss: false,
  draggable: false,
  theme: 'colored',
};

const variantToType: Record<ToastVariant, TypeOptions> = {
  default: 'default',
  success: 'success',
  info: 'info',
  warning: 'warning',
  destructive: 'error',
};

const buildToastContent = (title?: React.ReactNode, description?: React.ReactNode): ToastContent => {
  if (!title && !description) return null;

  return (
    <div className='flex flex-col gap-1'>
      {title ? <p className='text-sm font-semibold text-white dark:text-white'>{title}</p> : null}
      {description ? <p className='text-sm text-white dark:text-slate-200'>{description}</p> : null}
    </div>
  );
};

const showToastInternal = (payload: ToastMessage = {}) => {
  const { title, description, variant = 'default', type, ...options } = payload;

  const content = buildToastContent(title, description) ?? title ?? description ?? '';

  return toastify(content, {
    ...defaultToastOptions,
    type: type ?? variantToType[variant],
    ...options,
  });
};

const dismissToastInternal = (toastId?: Id) => toastify.dismiss(toastId);

function useToastMessage() {
  const showToast = useCallback((payload?: ToastMessage) => showToastInternal(payload), []);

  const showSuccess = useCallback((payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'success' }), [showToast]);
  const showError = useCallback((payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'destructive' }), [showToast]);
  const showInfo = useCallback((payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'info' }), [showToast]);
  const showWarning = useCallback((payload: Omit<ToastMessage, 'variant'>) => showToast({ ...payload, variant: 'warning' }), [showToast]);

  const dismiss = useCallback((toastId?: Id) => dismissToastInternal(toastId), []);

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

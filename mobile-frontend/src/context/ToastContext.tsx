import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { PecaeToast, ToastType, PecaeToastAction } from '../components/PecaeUI/PecaeToast';

interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  actions?: PecaeToastAction[];
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastState, setToastState] = useState<ToastOptions & { visible: boolean }>({
    visible: false,
    title: '',
  });

  const showToast = useCallback((options: ToastOptions) => {
    // Força um ciclo de hide antes de mostrar novo toast para resetar animação
    setToastState(prev => ({ ...prev, visible: false }));
    setTimeout(() => {
      setToastState({ ...options, visible: true });
    }, 50);
  }, []);

  const hideToast = useCallback(() => {
    setToastState(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <PecaeToast
        visible={toastState.visible}
        type={toastState.type}
        title={toastState.title}
        message={toastState.message}
        actions={toastState.actions}
        duration={toastState.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  }
  return ctx;
}

'use client';

import { SnackbarProvider, type SnackbarProviderProps } from 'notistack';
import { SessionProvider } from 'next-auth/react';
import type { ComponentType, ReactNode } from 'react';

// Cast SnackbarProvider to ComponentType to ensure React 19 JSX type compatibility
const CompatibleSnackbarProvider = SnackbarProvider as unknown as ComponentType<SnackbarProviderProps>;

export function NotificationProvider({ children }: { children: ReactNode }) {
  return (
    <CompatibleSnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={3500}
      dense
    >
      {children}
    </CompatibleSnackbarProvider>
  );
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

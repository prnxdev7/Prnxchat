
'use client';

import React from 'react';
import { AuthProvider } from './auth/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

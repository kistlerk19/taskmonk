import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/lib/auth/authContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect, useState } from 'react';

// Import Amplify configuration
import '@/amplifyconfiguration';

// Create a client for React Query
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only set client-side state
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a minimal loading state during SSR
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
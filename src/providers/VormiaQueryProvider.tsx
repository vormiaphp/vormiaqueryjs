import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VormiaClient, createVormiaClient, setGlobalVormiaClient } from '../client/createVormiaClient';
import { VormiaConfig } from '../types';

interface VormiaQueryProviderProps {
  children: ReactNode;
  config: VormiaConfig;
  queryClient?: QueryClient;
}

interface VormiaContextType {
  client: VormiaClient;
  queryClient: QueryClient;
}

const VormiaContext = createContext<VormiaContextType | null>(null);

export const useVormiaContext = (): VormiaContextType => {
  const context = useContext(VormiaContext);
  if (!context) {
    throw new Error('useVormiaContext must be used within a VormiaQueryProvider');
  }
  return context;
};

export const VormiaQueryProvider = ({
  children,
  config,
  queryClient,
}: VormiaQueryProviderProps) => {
  // Create default query client if not provided
  const defaultQueryClient = React.useMemo(() => {
    return queryClient || new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          refetchOnWindowFocus: false,
          retry: (failureCount, error: any) => {
            // Don't retry on 4xx errors except 408, 429
            if (error?.status >= 400 && error?.status < 500) {
              return error.status === 408 || error.status === 429 ? failureCount < 2 : false;
            }
            // Retry on 5xx errors up to 3 times
            return failureCount < 3;
          },
        },
        mutations: {
          retry: false,
        },
      },
    });
  }, [queryClient]);

  // Create Vormia client
  const vormiaClient = React.useMemo(() => {
    const client = createVormiaClient(config);
    setGlobalVormiaClient(client);
    return client;
  }, [config]);

  const contextValue = React.useMemo(() => ({
    client: vormiaClient,
    queryClient: defaultQueryClient,
  }), [vormiaClient, defaultQueryClient]);

  // Create a fragment to wrap the providers
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      VormiaContext.Provider,
      { value: contextValue },
      React.createElement(
        QueryClientProvider,
        { client: defaultQueryClient },
        children
      )
    )
  );
};
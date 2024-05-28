import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import apigeneric from './components/services/api-generic';
import api from './components/services/api';
import auth from './components/services/auth';
import apiAn from './components/services/analytics-api';

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
  if (import.meta.env.REACT_APP_LOCAL === 'true') {
    if (queryKey.includes('prod')) {
      const { data } = await apigeneric.get(queryKey[0] as string);
      return data?.response;
    }
  }

  if (queryKey.includes('profile-settings')) {
    const { data } = await apiAn.get(queryKey[0] as string);
    return data;
  }

  if ((queryKey[0] as string).includes('auth')) {
    const { data } = await auth.get(queryKey[0] as string);
    return data;
  }

  const { data } = await api.get(queryKey[0] as string);
  return data;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
    },
  },
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <CookiesProvider>
        <App />
      </CookiesProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

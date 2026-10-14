import { createNotificationsClient } from '@buerokratt-ria/notifications';
import { NotificationsProvider } from '@buerokratt-ria/notifications/react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider, QueryFunction } from '@tanstack/react-query';
import { api, analyticsApi, authApi, genericApi, AxiosInterceptor } from './components/services/api';

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
  if (import.meta.env.REACT_APP_LOCAL === 'true') {
    if (queryKey.includes('prod')) {
      const { data } = await genericApi.get(queryKey[0] as string);
      return data?.response;
    }
  }

  if (queryKey.includes('profile-settings')) {
    const { data } = await analyticsApi.get(queryKey[0] as string);
    return data;
  }

  if ((queryKey[0] as string).includes('auth')) {
    const { data } = await authApi.get(queryKey[0] as string);
    return data;
  }

  const { data } = await api.get(queryKey[0] as string);
  return data;
};

const notificationsClient = createNotificationsClient({
  apiBaseUrl: import.meta.env.REACT_APP_NOTIFICATIONS_NODE_URL,
  vapidPublicKey: import.meta.env.REACT_APP_NOTIFICATIONS_VAPID_PUBLIC_KEY,
});

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
      <AxiosInterceptor>
        <CookiesProvider>
          <NotificationsProvider client={notificationsClient}>
            <App />
          </NotificationsProvider>
        </CookiesProvider>
      </AxiosInterceptor>
    </QueryClientProvider>
  </React.StrictMode>
);

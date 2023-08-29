import React from 'react'
import ReactDOM, {createRoot} from 'react-dom/client'
import './i18n';
import App from './App'
import { CookiesProvider } from 'react-cookie';
import {
    QueryClient,
    QueryClientProvider,
    QueryFunction,
} from '@tanstack/react-query';

import api from './components/services/api';
import auth from "./components/services/auth";
import apiDev from "./components/services/api-dev";
import apiDevV2 from "./components/services/api-dev-v2";
import apiAn from './components/services/analytics-api';

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
    if (queryKey.includes('prod')) {
        const { data } = await apiDev.get(queryKey[0] as string);
        return data;
    }
    if (queryKey.includes('user-profile-settings')) {
        const { data } = await apiAn.get(queryKey[0] as string);
        return data;
    }
    if (queryKey[1] === 'prod-2') {
        const { data } = await apiDevV2.get(queryKey[0] as string);
        return data?.response;
    }
    if(queryKey[1] === 'auth') {
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

const root = createRoot(document.getElementById('root')!)
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <CookiesProvider>
                <App />
            </CookiesProvider>
        </QueryClientProvider>
    </React.StrictMode>
)

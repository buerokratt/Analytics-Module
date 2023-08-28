import React from 'react'
import ReactDOM, {createRoot} from 'react-dom/client'
import './i18n';
import * as serviceWorker from './serviceWorker'
import App from './App'
import { CookiesProvider } from 'react-cookie';
import {
    QueryClient,
    QueryClientProvider,
    QueryFunction,
} from '@tanstack/react-query';

import api from './components/services/api';
import {loadEnv} from "vite";
import {BrowserRouter} from "react-router-dom";
import auth from "./components/services/auth";

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
    if(queryKey[1] === 'auth') {
        const { data } = await auth.get(queryKey[0] as string);
        console.log(data)
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

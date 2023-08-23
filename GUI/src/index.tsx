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

import {setupWorker} from "msw";
import { handlers } from './mocks/handlers';
import {loadEnv} from "vite";
import {BrowserRouter} from "react-router-dom";
import apiDevV2 from "./components/services/api-dev-v2";
import apiDev from "./components/services/api-dev";

const defaultQueryFn: QueryFunction | undefined = async ({ queryKey }) => {
    if (queryKey.includes('prod')) {
        const { data } = await apiDev.get(queryKey[0] as string);
        return data;
    }

    if (queryKey[1] === 'prod-2') {
        const { data } = await apiDevV2.get(queryKey[0] as string);
        return data?.response;
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


const worker = setupWorker(...handlers);

const prepare = async () => {
        return worker.start({
            serviceWorker: {
                url: './mockServiceWorker.js'
            }
        });

    /*   if (import.meta.env.MODE === 'development') {
        // return worker.start();
        return worker.start({
          serviceWorker: {
            url: 'burokratt/mockServiceWorker.js'
          }
        });
      }
      return Promise.resolve(); */
};

// IF mocking is enabled then it would wrap base with mocking part
if(import.meta.env.REACT_APP_MOCK_ENABLED === 'true') {
    console.log('mocking enabled')
    prepare().then(() => {
        ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
            <React.StrictMode>
                <QueryClientProvider client={queryClient}>
                    <CookiesProvider>
                        <App />
                    </CookiesProvider>
                </QueryClientProvider>
            </React.StrictMode>,
        );
    });
} else {
    console.log('mocking disabled')
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

}



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

import React from 'react'
import { createRoot } from 'react-dom/client'
import './i18n';
import * as serviceWorker from './serviceWorker'
import App from './App'
import { CookiesProvider } from 'react-cookie';

const root = createRoot(document.getElementById('root')!)
root.render(
    <React.StrictMode>
        <CookiesProvider>
           <App />
        </CookiesProvider>
    </React.StrictMode>
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

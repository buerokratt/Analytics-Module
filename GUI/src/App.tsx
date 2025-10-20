import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';
import {PersistGate} from 'redux-persist/integration/react';
import {ToastProvider} from './components/context/ToastContext';
import RootComponent from './RootComponent';
import {persistor, store as reducerStore} from './store/reducers/store';
import {UserInfo} from './types/userInfo';
import useStore from './store/user/store';
import {useQuery} from '@tanstack/react-query';
import {PeriodStatisticsProvider} from 'components/context/PeriodStatisticsContext';
import {getWidgetData} from "./components/services/user";
import {CHAT_SESSIONS} from "./util/constants";
import {generateUEID} from "./util/generateUEID";

const App: React.FC = () => {
    const multiDomainEnabled = import.meta.env.REACT_APP_ENABLE_MULTI_DOMAIN?.toLowerCase() === 'true';

    useQuery<UserInfo>({
        queryKey:
            import.meta.env.REACT_APP_LOCAL === 'true'
                ? ['userinfo', 'prod']
                : [(import.meta.env.REACT_APP_AUTH_BASE_URL, 'auth/jwt/userinfo')],
        onSuccess: (res: { response: UserInfo }) => {
            if (import.meta.env.REACT_APP_LOCAL != 'true') {
                localStorage.setItem('exp', res.response.JWTExpirationTimestamp);
            }

            if (multiDomainEnabled) {
                getWidgetData(res.response.idCode)
                    .then((domains) => {
                        const selectedDomains = domains
                            .filter(d => d.selected)
                            .map(d => d.url)
                            .filter(Boolean);

                        useStore.getState().setUserDomains(selectedDomains);
                    })
                    .catch((e) => {
                        console.error('Failed to fetch widget data:', e);
                    });
            }

            return useStore.getState().setUserInfo(res.response);
        },
    });

    useEffect(() => {
        const delay = 1000;

        const timeOutId = setTimeout(() => {
            initializeSession();
        }, delay);

        return () => clearTimeout(timeOutId);
    }, []);


    const initializeSession = () => {
        let tabId = sessionStorage.getItem(CHAT_SESSIONS.SESSION_ID_KEY);
        if (!tabId) {
            tabId = generateUEID();
            sessionStorage.setItem(CHAT_SESSIONS.SESSION_ID_KEY, tabId);
        }

        let currentState = getCurrentSessionState();

        if (!currentState.ids.includes(tabId)) {
            currentState.ids.push(tabId);
            currentState.count = currentState.ids.length;
            localStorage.setItem(
                CHAT_SESSIONS.SESSION_STATE_KEY,
                JSON.stringify(currentState)
            );
        }

        const handleTabClose = () => {
            const currentAppState = JSON.parse(
                localStorage.getItem(CHAT_SESSIONS.SESSION_STATE_KEY) as string
            ) || { ids: [], count: 0 };

            const updatedIds = currentAppState.ids.filter(
                (id: string) => id !== tabId
            );
            const updatedState = {
                ids: updatedIds,
                count: updatedIds.length,
            };

            localStorage.setItem(
                CHAT_SESSIONS.SESSION_STATE_KEY,
                JSON.stringify(updatedState)
            );
        };

        window.addEventListener("beforeunload", handleTabClose);

        return () => {
            window.removeEventListener("beforeunload", handleTabClose);
        };
    };

    const getCurrentSessionState = () => {
        return (
            JSON.parse(
                localStorage.getItem(CHAT_SESSIONS.SESSION_STATE_KEY) as string
            ) || { ids: [], count: 0 }
        );
    };

    return (
        <Provider store={reducerStore}>
            <PersistGate
                loading={null}
                persistor={persistor}
            >
                <BrowserRouter basename={import.meta.env.BASE_URL}>
                    <ToastProvider>
                        <PeriodStatisticsProvider>
                            <RootComponent/>
                        </PeriodStatisticsProvider>
                    </ToastProvider>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    );
};

export default App;

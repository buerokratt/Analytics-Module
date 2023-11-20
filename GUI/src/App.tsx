import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastProvider } from './components/Toast/ToastContext'
import RootComponent from './RootComponent'
import { persistor, store as reducerStore} from './store/reducers/store'
import {UserInfo} from "./types/userInfo";
import useStore from "./store/user/store";
import { useQuery } from "@tanstack/react-query";

const App: React.FC = () => {
    if(import.meta.env.REACT_APP_LOCAL === 'true') {
        const { data } = useQuery<UserInfo>({
            queryKey: ['cs-custom-jwt-userinfo', 'prod'],
            onSuccess: (res: any) => useStore.getState().setUserInfo(res)
        })
    } else {
        const { data: userInfo } = useQuery<UserInfo>({
            queryKey: [import.meta.env.REACT_APP_AUTH_PATH, 'auth'],
            onSuccess: (data: { data: { custom_jwt_userinfo: UserInfo } }) => {
                localStorage.setItem(
                    'exp',
                    data.data.custom_jwt_userinfo.JWTExpirationTimestamp
                );
                return useStore.getState().setUserInfo(data.data.custom_jwt_userinfo);
            }
        });
    }


  return (
    <Provider store={reducerStore}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ToastProvider>
            <RootComponent />
          </ToastProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

export default App

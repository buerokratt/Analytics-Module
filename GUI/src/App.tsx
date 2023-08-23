import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastProvider } from './components/Toast/ToastContext'
import RootComponent from './RootComponent'
import { persistor, store as reducerStore} from './store/reducers/store'
import {UserInfo} from "./types/userInfo";
import {useQuery} from "@tanstack/react-query";
import useUserInfoStore from "./store/user/store";

const App: React.FC = () => {
    const userInfoStore = useUserInfoStore();
    const { data: userInfo } = useQuery<{
        data: { custom_jwt_userinfo: UserInfo };
    }>({
        queryKey: ['cs-custom-jwt-userinfo', 'prod'],
        onSuccess: (data: { data: { custom_jwt_userinfo: UserInfo } }) =>
            userInfoStore.setUserInfo(data.data.custom_jwt_userinfo),
    });

  return (
    <Provider store={reducerStore}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <BrowserRouter basename={'/analytics'}>
          <ToastProvider>
            <RootComponent />
          </ToastProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

export default App

import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastProvider } from './components/Toast/ToastContext'
import RootComponent from './RootComponent'
import { persistor, store as reducerStore} from './store/reducers/store'
import {UserInfo} from "./types/userInfo";
import auth from "./components/services/auth"
import useUserInfoStore from "./store/user/store";
import { useQuery } from "@tanstack/react-query";

const App: React.FC = () => {
    const userInfoStore = useUserInfoStore();
        const { data: userInfo } = useQuery<UserInfo>({
        queryKey: [import.meta.env.REACT_APP_AUTH_PATH, 'auth'],
        onSuccess: (data) => userInfoStore.setUserInfo(data.response.body),
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

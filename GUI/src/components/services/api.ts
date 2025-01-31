import axios, { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const testCookie = 'bearer ' + (localStorage.getItem('token') ?? 'test');

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_BASE_API_PATH,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const analyticsApi = axios.create({
  baseURL: import.meta.env.REACT_APP_RUUTER_V2_ANALYTICS_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const authApi = axios.create({
  baseURL: import.meta.env.REACT_APP_AUTH_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const genericApi = axios.create({
  baseURL: import.meta.env.REACT_APP_RUUTER_PRIVATE_API_URL + '/generic/',
  headers: {
    Accept: 'application/json',
    Testcookie: '',
  },
  withCredentials: false,
});

const ruuterApi = axios.create({
  baseURL: import.meta.env.REACT_APP_RUUTER_PRIVATE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const AxiosInterceptor = ({ children }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const resInterceptor = (response: any) => {
      import.meta.env.DEBUG_ENABLED && console.debug(response);

      return response;
    }

    const errInterceptor = (error: any) => {
      import.meta.env.DEBUG_ENABLED && console.debug(error);

      let message = t('global.notificationErrorMsg');

      return Promise.reject(new Error(message));
    }

    const apiInterceptor = api.interceptors.response.use(resInterceptor, errInterceptor);
    const analyticsApiInterceptor = analyticsApi.interceptors.response.use(resInterceptor, errInterceptor);
    const authApiInterceptor = authApi.interceptors.response.use(resInterceptor, errInterceptor);
    const genericInterceptor = genericApi.interceptors.response.use(resInterceptor, errInterceptor);
    const ruuterInterceptor = ruuterApi.interceptors.response.use(resInterceptor, errInterceptor);

    return () => {
      api.interceptors.response.eject(apiInterceptor);
      analyticsApi.interceptors.response.eject(analyticsApiInterceptor);
      authApi.interceptors.response.eject(authApiInterceptor);
      genericApi.interceptors.response.eject(genericInterceptor);
      ruuterApi.interceptors.response.eject(ruuterInterceptor);
    };

  }, [t]);

  return children;
}

const handleRequestError = (error: AxiosError) => {
  import.meta.env.DEBUG_ENABLED && console.debug(error);

  if (error.response?.status === 401) {
    // To be added: handle unauthorized requests
  }
  if (error.response?.status === 403) {
    // To be added: handle forbidden requests
  }
  return Promise.reject(new Error(error.message));
}

api.interceptors.request.use(
  (axiosRequest) => axiosRequest,
  handleRequestError
);

analyticsApi.interceptors.request.use(
  (axiosRequest) => axiosRequest,
  handleRequestError
);

authApi.interceptors.request.use(
  (axiosRequest) => axiosRequest,
  handleRequestError
);

genericApi.interceptors.request.use(
  (config) => {
    config.headers['Testcookie'] = testCookie;
    return config;
  },
  handleRequestError
);

ruuterApi.interceptors.request.use(
  (axiosRequest) => axiosRequest,
  handleRequestError
);

export { api, analyticsApi, authApi, genericApi, ruuterApi, AxiosInterceptor };

import axios, { AxiosError } from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.REACT_APP_BASE_API_PATH,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized requests
    }
    return Promise.reject(new Error(error.message));
  },
);

export default instance;

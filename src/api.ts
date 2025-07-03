import axios, {isAxiosError} from 'axios';
import store from './store/store';
import {BASE_URL} from './theme';

type APIResponse<T> = {
  data: T | null;
  message: string | null;
  status: number;
};

// const apiFetch = axios.create({
//   baseURL: 'http://localhost:8080/api/app',
// });

// const authFetch = axios.create({
//   baseURL: 'http://localhost:8080/api/app',
// });
const apiFetch = axios.create({
  baseURL: BASE_URL,
});

const authFetch = axios.create({
  baseURL: BASE_URL,
});

// Request Interceptors
authFetch.interceptors.request.use(
  config => {
    const state = store.getState();
    const token = state.user.token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response Interceptors
authFetch.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (isAxiosError(error) && error.status === 401) {
      // logout
    }
    return Promise.reject(error);
  },
);

type GET = {
  endpoint: string;
  params?: {[key: string]: string | number | Array<number>};
  requiresAuth?: boolean;
};

export const GET = async <T>({
  endpoint,
  params,
  requiresAuth = true,
}: GET): Promise<APIResponse<T>> => {
  const config = {
    params,
  };

  console.log('endpoint', endpoint);

  try {
    const response = await (requiresAuth ? authFetch : apiFetch).get(endpoint, {
      headers: {
        'Accept-Language': 'en',
      },
      ...config,
    });

    // console.log('response', response);
    return {
      data: response?.data,
      message: response?.data?.message,
      status: response?.status,
    };
  } catch (error) {
    const axiosError = isAxiosError(error);

    return {
      data: axiosError ? error?.response?.data?.errors : null,
      message: axiosError ? error?.response?.data?.message : null,
      status: axiosError ? error?.response?.status || 500 : 500,
    };
  }
};

type POST = {
  endpoint: string;
  formData?: {[key: string]: any} | FormData;
  requiresAuth?: boolean;
};

export const POST = async <T>({
  endpoint,
  formData,
  requiresAuth = true,
}: POST): Promise<APIResponse<T>> => {
  console.log('endpoint', endpoint);

  try {
    const response = await (requiresAuth ? authFetch : apiFetch).post(
      endpoint,
      formData,
    );

    return {
      data: response?.data,
      message: response?.data?.message,
      status: response?.status,
    };
  } catch (error) {
    const axiosError = isAxiosError(error);

    return {
      data: axiosError ? error.response?.data?.errors : null,
      message: axiosError ? error.response?.data?.message : null,
      status: axiosError ? error.response?.status || 500 : 500,
    };
  }
};

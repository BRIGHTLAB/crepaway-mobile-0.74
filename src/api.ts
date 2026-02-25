import axios, { AxiosInstance, isAxiosError } from 'axios';
import store from './store/store';
import { BASE_URL } from './theme';

type APIResponse<T> = {
  data: T | null;
  message: string | null;
  status: number;
};

// Cache for axios instances to avoid recreating them
const axiosInstances = new Map<string, AxiosInstance>();
const authAxiosInstances = new Map<string, AxiosInstance>();

// Helper function to get or create an axios instance
const getAxiosInstance = (baseUrl: string): AxiosInstance => {
  if (!axiosInstances.has(baseUrl)) {
    const instance = axios.create({
      baseURL: baseUrl,
    });
    axiosInstances.set(baseUrl, instance);
  }
  return axiosInstances.get(baseUrl)!;
};

// Helper function to get or create an authenticated axios instance
const getAuthAxiosInstance = (baseUrl: string): AxiosInstance => {
  if (!authAxiosInstances.has(baseUrl)) {
    const instance = axios.create({
      baseURL: baseUrl,
    });

    // Request Interceptor
    instance.interceptors.request.use(
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

    // Response Interceptor
    instance.interceptors.response.use(
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

    authAxiosInstances.set(baseUrl, instance);
  }
  return authAxiosInstances.get(baseUrl)!;
};

type GET = {
  endpoint: string;
  params?: { [key: string]: string | number | Array<number> };
  requiresAuth?: boolean;
  baseUrl?: string;
};

export const GET = async <T>({
  endpoint,
  params,
  requiresAuth = true,
  baseUrl = BASE_URL,
}: GET): Promise<APIResponse<T>> => {
  const config = {
    params,
  };

  console.log('endpoint', endpoint);

  try {
    const axiosInstance = requiresAuth
      ? getAuthAxiosInstance(baseUrl)
      : getAxiosInstance(baseUrl);

    const response = await axiosInstance.get(endpoint, {
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
  formData?: { [key: string]: any } | FormData;
  requiresAuth?: boolean;
  baseUrl?: string;
};

export const POST = async <T>({
  endpoint,
  formData,
  requiresAuth = true,
  baseUrl = BASE_URL,
}: POST): Promise<APIResponse<T>> => {
  console.log('endpoint', endpoint);

  try {
    const axiosInstance = requiresAuth
      ? getAuthAxiosInstance(baseUrl)
      : getAxiosInstance(baseUrl);

    const response = await axiosInstance.post(endpoint, formData);

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

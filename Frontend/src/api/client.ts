import axios, { AxiosError } from 'axios';
import { authStorage } from './storage';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; error?: string }>) => {
    if (error.response?.status === 401) {
      authStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const apiMessage = error.response?.data?.error;
    return Promise.reject(new Error(apiMessage || error.message || 'Erro inesperado'));
  },
);

export async function unwrap<T>(request: Promise<{ data: { success: boolean; data?: T; error?: string } }>): Promise<T> {
  const response = await request;
  if (!response.data.success) {
    throw new Error(response.data.error || 'Erro inesperado');
  }
  return response.data.data as T;
}

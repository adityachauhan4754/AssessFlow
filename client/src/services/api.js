import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // For sending HttpOnly cookies
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customMessage = error.response?.data?.message || 'Something went wrong, please try again';
    if (error.response?.status === 401) {
      customMessage = 'Session expired, please log in again';
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/session-expired') {
        window.location.href = '/session-expired';
      }
    } else if (error.response?.status === 403) {
      customMessage = 'Not authorized to perform this action';
    } else if (error.response?.status === 404) {
      customMessage = error.response?.data?.message || 'Resource not found';
    } else if (error.response?.status === 409) {
      customMessage = 'Conflict: Resource already exists';
    } else if (error.response?.status >= 500) {
      customMessage = 'Server error, please try again later';
    }
    
    if (error.response && error.response.data) {
      error.response.data.message = customMessage;
    }
    error.customMessage = customMessage;
    return Promise.reject(error);
  }
);

export default api;

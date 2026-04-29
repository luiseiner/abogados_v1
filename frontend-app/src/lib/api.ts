import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/capitalfarmer.co/api/v1`
    : "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Cualquier código de estado que esté dentro del rango de 2xx
    return response;
  },
  (error) => {
    // Manejo de errores globales
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      switch (error.response.status) {
        case 401:
          // Token inválido o expirado
          localStorage.removeItem("access_token");
          window.location.href = "/";
          break;
        case 403:
          console.error("No tienes permisos para esta acción");
          break;
        case 404:
          console.error("Recurso no encontrado");
          break;
        case 500:
          console.error("Error del servidor");
          break;
        default:
          console.error(`Error: ${error.response.status}`);
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error("No hay respuesta del servidor");
    } else {
      // Algo pasó al configurar la petición
      console.error("Error en la configuración:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
  import axios from "axios";
  import { ACCESS_TOKEN } from "./constants";

  const API_BASE_URL = "http://127.0.0.1:8000/";
  console.log("API Base URL:", API_BASE_URL); // Debugging line

  const api = axios.create({
      baseURL: 'http://127.0.0.1:8000/'
  })

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Access Token:", token);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  export default api;

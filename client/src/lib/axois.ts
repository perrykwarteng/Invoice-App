// import axios from "axios";
// import { useAccessToken } from "@/store/useAccessTokenStore";

// const baseURL = process.env.NEXT_PUBLIC_API_URL!;

// export const api = axios.create({
//   baseURL: `${baseURL}/api/v1`,
//   withCredentials: true,
// });

// api.interceptors.request.use((config) => {
//   const token = useAccessToken.getState().accessToken;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const { data } = await axios.post(
//           `${baseURL}/api/v1/auth/refresh`,
//           {},
//           {
//             withCredentials: true,
//           },
//         );

//         useAccessToken.getState().setAccessToken(data.accessToken);

//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

//         return api(originalRequest);
//       } catch (err) {
//         useAccessToken.getState().setAccessToken("");
//         window.location.href = "/login";
//         return Promise.reject(err);
//       }
//     }

//     return Promise.reject(error);
//   },
// );

import axios from "axios";
import { useAccessToken } from "@/store/useAccessTokenStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL!;

export const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAccessToken.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/api/v1/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        useAccessToken.getState().setAccessToken(data.accessToken);
        return data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        useAccessToken.getState().setAccessToken("");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

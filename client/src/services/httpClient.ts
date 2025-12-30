import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from "axios";

// Use Vite dev proxy in development (frontend -> /api). In production use configured backend URL.
const apiURL = import.meta.env.DEV
  ? "/api"
  : `${
      import.meta.env.VITE_BACKEND_BASE_URL ??
      "https://wat2eat-web-api-fugqfjdce4b3gth0.swedencentral-01.azurewebsites.net"
    }/api`;

export const httpClient: AxiosInstance = axios.create({
  baseURL: apiURL, // Vi behöver INTE skicka Authorization header; cookies sköter det
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => {
  // Om datan är FormData (t.ex. vid bilduppladdning)
  if (config.data instanceof FormData) {
    // Ta bort Content-Type så att webbläsaren sätter korrekt boundary
    delete config.headers["Content-Type"];
  } else {
    // JSON som standard
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// --- Token Rotation State ---
let isRefreshing = false;
// Kön för requests som väntar på den nya token.
// Lagrar Promise resolve/reject-funktioner för att sprida felet korrekt.
let failedRequests: {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  originalRequest: AxiosRequestConfig;
}[] = [];

// --- Response Interceptor ---
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean; // Flagga för att förhindra oändlig loop
    };

    const status = error.response?.status;
    const isRefreshRequest = originalRequest.url?.includes(
      "/auth/refresh-token"
    );
    const isLoginRequest = originalRequest.url?.includes("/auth/login"); // 1. Fånga 401 Unauthorized där Access Token har löpt ut

    if (status === 401 && !originalRequest._retry && !isLoginRequest) {
      // KRITISK KONTROLL: Om /refresh-token returnerar 401, måste vi logga ut
      if (isRefreshRequest) {
        return Promise.reject(error);
      } // 2. Vänta om förnyelse redan pågår

      if (isRefreshing) {
        // Köa den ursprungliga förfrågan
        return new Promise((resolve, reject) => {
          failedRequests.push({ resolve, reject, originalRequest });
        });
      } // 3. Starta förnyelse (första 401:an)

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Anropa refresh endpointen direkt med raw axios. Detta undviker cirkulära imports.
        await axios.post(
          `${apiURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        failedRequests.forEach(({ resolve, originalRequest }) => {
          resolve(httpClient.request(originalRequest));
        });
        failedRequests = []; // Försök den ursprungliga förfrågan igen

        return httpClient(originalRequest);
      } catch (err) {
        // Refresh misslyckades. Tvinga ut alla köade requests att misslyckas.
        failedRequests.forEach(({ reject }) => reject(err));
        failedRequests = [];
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    // 4. Returnera alla andra fel
    return Promise.reject(error);
  }
);

export default httpClient;

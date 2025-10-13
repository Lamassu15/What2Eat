import axios from "axios"

const API_BASE = "http://localhost:5163/api";

export const httpClient = async (url: string, options: RequestInit = {}) => {

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers, // tillåt override om det behövs
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: "include", // Lägg till cookies i alla förfrågningar
  });

  if (!response.ok) {
    // bättre felhantering: returnera json om möjligt
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // ignore om ingen json finns
    }
    throw new Error(errorMessage);
  }
  // Some endpoints (DELETE) may return 204 No Content. In that case
  // response.json() will throw — handle that and return null so callers
  // (mutations expecting void) resolve correctly and React Query can
  // invalidate/refetch.
  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    // If parsing fails (no JSON body), return null so higher-level
    // API helpers can interpret as void/null.
    return null;
  }
};

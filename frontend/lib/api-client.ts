import { ApiError } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  // Set default JSON headers
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Load token dynamically from localStorage if on the client
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("todo_api_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Handle empty 204 No Content response
  if (response.status === 204) {
    return null as T;
  }

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData: ApiError = json || {
      message: response.statusText || "Something went wrong",
    };
    throw errorData;
  }

  return json as T;
}

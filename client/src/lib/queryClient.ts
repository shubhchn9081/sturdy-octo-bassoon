import { QueryClient } from "@tanstack/react-query";

interface ApiRequestInit extends RequestInit {
  on401?: "returnNull" | "throw";
}

export async function apiRequest(
  method: string,
  path: string,
  body?: any,
  options?: ApiRequestInit,
) {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
    ...options,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(path, requestOptions);

  if (response.status === 401) {
    if (options?.on401 === "returnNull") {
      return null;
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || errorData.error || "Something went wrong",
    );
  }

  return response;
}

export const getQueryFn = (options?: ApiRequestInit) => async ({ queryKey }: { queryKey: unknown[] }) => {
  const [url] = queryKey as [string, ...unknown[]];

  try {
    const response = await apiRequest("GET", url, undefined, options);
    if (response === null) return null;
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
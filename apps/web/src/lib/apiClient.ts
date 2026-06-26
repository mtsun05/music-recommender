import type {
  CurrentUserResponse,
  RecommendationRequestCreateInput,
  RecommendationRequestCreateResponse,
  RecommendationRequestStatusResponse
} from "@music-recommender/shared";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

type RecentRequest = {
  id: string;
  status: string;
  input: string;
  requestedLimit: number;
  createdAt: string;
};

type ApiErrorBody = {
  error?: string;
  code?: string;
  retryable?: boolean;
};

export class ApiClientError extends Error {
  code?: string;
  retryable?: boolean;

  constructor(message: string, options: { code?: string; retryable?: boolean } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.code = options.code;
    this.retryable = options.retryable;
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | T | null;

  if (!response.ok) {
    const errorBody = body as ApiErrorBody | null;
    throw new ApiClientError(errorBody?.error ?? `Request failed with ${response.status}`, {
      code: errorBody?.code,
      retryable: errorBody?.retryable
    });
  }

  return body as T;
}

export function createApiClient(getToken: () => Promise<string | null>) {
  async function request<T>(path: string, options: RequestInit = {}) {
    const token = await getToken();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers
    });

    return parseJsonResponse<T>(response);
  }

  return {
    getMe: () => request<CurrentUserResponse>("/me"),
    listRecommendationRequests: () =>
      request<{ requests: RecentRequest[] }>("/recommendation-requests"),
    createRecommendationRequest: (input: RecommendationRequestCreateInput) =>
      request<RecommendationRequestCreateResponse>("/recommendation-requests", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    getRecommendationRequest: (id: string) =>
      request<RecommendationRequestStatusResponse>(`/recommendation-requests/${id}`)
  };
}

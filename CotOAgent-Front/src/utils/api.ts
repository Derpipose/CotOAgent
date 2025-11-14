/**
 * API error class
 */
export class ApiError extends Error {
  statusCode: number;
  data?: unknown;

  constructor(statusCode: number, message: string, data?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Parse error response from API
 */
const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (data.error?.message) {
      return data.error.message;
    }
    if (data.error) {
      return typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
    return `HTTP ${response.status}: ${response.statusText}`;
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
};

/**
 * Enhanced fetch wrapper with error handling
 */
export const apiCall = async <T = Record<string, unknown>>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorMessage = await parseErrorResponse(response);
      throw new ApiError(response.status, errorMessage);
    }

    // Parse and return JSON data
    return await response.json();
  } catch (error) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        'Network error. Please check your connection and try again.'
      );
    }

    // Handle unknown errors
    throw new ApiError(
      500,
      error instanceof Error ? error.message : 'An unknown error occurred'
    );
  }
};

/**
 * Get the base API URL
 */
export const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/api';
  }

  return window.location.protocol === 'https:'
    ? `https://${window.location.hostname}/api`
    : 'http://localhost:3000/api';
};

/**
 * Build a full API URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

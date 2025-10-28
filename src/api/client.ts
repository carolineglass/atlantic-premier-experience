import { authService } from './auth';

interface RequestConfig extends RequestInit {
  params?: Record<string, unknown>;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle page object specially for pagination
          if (key === 'page' && typeof value === 'object') {
            if (value.number)
              url.searchParams.append('page[number]', String(value.number));
            if (value.size)
              url.searchParams.append('page[size]', String(value.size));
          } else if (Array.isArray(value)) {
            value.forEach((item) => url.searchParams.append(key, String(item)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.pathname + url.search;
  }

  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Get a valid access token
    const accessToken = await authService.getAccessToken();

    // Build URL with params
    const url = this.buildUrl(endpoint, params);

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...fetchOptions.headers,
      },
    };

    const response = await fetch(url, config);

    // Handle token expiration - retry with new token
    // BUT ONLY if we're not on the auth endpoint itself!
    if (response.status === 401 && !endpoint.includes('oauthorize')) {
      console.log('Token expired, refreshing...');

      try {
        const newToken = await authService.refreshAccessToken();

        // Retry request with new token
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };

        const retryResponse = await fetch(url, retryConfig);

        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }

        return retryResponse.json();
      } catch (error) {
        console.error('Retry failed:', error);
        throw error;
      }
    }

    // Handle rate limiting
    if (response.status === 429) {
      throw new Error('Rate limit exceeded - please wait before retrying');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    options?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();

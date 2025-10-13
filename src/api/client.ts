import { authService } from './auth';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get a valid access token
    const accessToken = await authService.getAccessToken();

    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
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

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

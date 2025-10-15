import type { TokenResponse, TokenData, AuthRequest } from '@/types/auth';

const TOKEN_STORAGE_KEY = 'tc_auth_token';

export class AuthService {
  private baseURL: string;
  private username: string;
  private password: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.username = import.meta.env.VITE_API_USERNAME;
    this.password = import.meta.env.VITE_API_PASSWORD;
  }

  /**
   * Get a valid access token (from storage or by requesting a new one)
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token in storage
    const storedToken = this.getStoredToken();

    if (storedToken && !this.isTokenExpired(storedToken)) {
      return storedToken.accessToken;
    }

    // Token is expired or doesn't exist, get a new one
    return await this.fetchNewToken();
  }

  /**
   * Request a new access token from the API
   */
  private async fetchNewToken(): Promise<string> {
    try {
      const requestBody: AuthRequest = {
        grant_type: 'password',
        username: this.username,
        password: this.password,
      };
      const response = await fetch(`${this.baseURL}/oauthorize/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        throw new Error(
          `Authentication failed: ${response.status} - ${errorBody}`
        );
      }

      const data: TokenResponse = await response.json();

      if (data.status !== 'success') {
        throw new Error('Authentication failed: Invalid response');
      }

      const tokenData: TokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      this.storeToken(tokenData);

      return data.access_token;
    } catch (error) {
      console.error('Failed to authenticate:', error);
      throw error;
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken(): Promise<string> {
    const storedToken = this.getStoredToken();

    if (!storedToken?.refreshToken) {
      return await this.fetchNewToken();
    }

    try {
      const requestBody: AuthRequest = {
        grant_type: 'refresh_token',
        refresh_token: storedToken.refreshToken,
      };
      const response = await fetch(`${this.baseURL}/oauthorize/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // If refresh fails, get a new token with username/password
        return await this.fetchNewToken();
      }

      const data: TokenResponse = await response.json();

      const tokenData: TokenData = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      this.storeToken(tokenData);

      return data.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return await this.fetchNewToken();
    }
  }

  /**
   * Store token in sessionStorage (not localStorage for security)
   */
  private storeToken(tokenData: TokenData): void {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
  }

  /**
   * Get stored token from sessionStorage
   */
  private getStoredToken(): TokenData | null {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as TokenData;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired (with 60 second buffer)
   */
  private isTokenExpired(tokenData: TokenData): boolean {
    const bufferTime = 60 * 1000;
    return Date.now() >= tokenData.expiresAt - bufferTime;
  }

  /**
   * Clear stored token (logout)
   */
  logout(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export const authService = new AuthService();

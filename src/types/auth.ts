export interface TokenResponse {
  status: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // Token expires in 3600 seconds (1 hour)
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp when token expires
}

export interface AuthRequest {
  grant_type: 'password' | 'refresh_token';
  username?: string;
  password?: string;
  refresh_token?: string;
}

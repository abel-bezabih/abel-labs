import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    avatar?: string;
  };
}

/**
 * Login and store tokens in localStorage
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
  
  if (response.data.accessToken && response.data.refreshToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  
  return response.data;
}

/**
 * Register a new user and store tokens in localStorage
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, credentials);
  
  if (response.data.accessToken && response.data.refreshToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
  }
  
  return response.data;
}

/**
 * Logout and clear tokens
 */
export function logout(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Get current refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Check token expiration (basic check - doesn't verify signature)
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpiration(token: string | null): number | null {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
}



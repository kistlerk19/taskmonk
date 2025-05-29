import { Auth } from 'aws-amplify';
import { ApiError, parseApiError } from './errorHandler';

// Use the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Get authentication headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
}

/**
 * Generic request function with error handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const headers = await getAuthHeaders();
    
    // Determine if we should use relative or absolute URL
    const isAbsoluteUrl = endpoint.startsWith('http');
    const url = isAbsoluteUrl ? endpoint : `${API_URL}${endpoint}`;
    
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string> || {}),
      },
    });

    if (!response.ok) {
      throw await parseApiError(response);
    }

    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ApiError(
        error.message === 'Failed to fetch' 
          ? 'Network error: Unable to connect to the server. Please check your internet connection and try again.'
          : error.message
      );
    }
    
    throw new ApiError('An unexpected error occurred');
  }
}

/**
 * API client with methods for different HTTP verbs
 */
export const api = {
  /**
   * Make a GET request to the API
   */
  get: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'GET' }),
  
  /**
   * Make a POST request to the API with JSON data
   */
  post: <T>(endpoint: string, data: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include', // Include credentials for cross-origin requests
    }),
  
  /**
   * Make a PUT request to the API with JSON data
   */
  put: <T>(endpoint: string, data: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include', // Include credentials for cross-origin requests
    }),
  
  /**
   * Make a DELETE request to the API
   */
  delete: <T>(endpoint: string) => 
    request<T>(endpoint, { 
      method: 'DELETE',
      credentials: 'include', // Include credentials for cross-origin requests
    }),
};
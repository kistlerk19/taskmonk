import { Auth } from 'aws-amplify';
import { ApiError, parseApiError } from './errorHandler';

// Use the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.taskmonk.app';

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
    const response = await fetch(`${API_URL}${endpoint}`, {
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
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ApiError(error.message);
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
    }),
  
  /**
   * Make a PUT request to the API with JSON data
   */
  put: <T>(endpoint: string, data: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  /**
   * Make a DELETE request to the API
   */
  delete: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'DELETE' }),
};
import { Auth } from 'aws-amplify';
import { ApiError, parseApiError } from './errorHandler';

// Use the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Retry configuration
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // Base delay in ms

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
 * Sleep function for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an error is a network error that should be retried
 */
function isRetryableError(error: any): boolean {
  if (error instanceof Error) {
    // Common network error messages
    return error.message === 'Failed to fetch' || 
           error.message.includes('NetworkError') ||
           error.message.includes('Network error') ||
           error.message.includes('network timeout') ||
           navigator.onLine === false;
  }
  return false;
}

/**
 * Generic request function with error handling and retry mechanism
 */
async function request<T>(
  endpoint: string, 
  options: RequestInit = {}, 
  maxRetries: number = DEFAULT_MAX_RETRIES
): Promise<T> {
  let retries = 0;
  
  while (true) {
    try {
      const headers = await getAuthHeaders();
      
      // Determine if we should use relative or absolute URL
      const isAbsoluteUrl = endpoint.startsWith('http');
      const url = isAbsoluteUrl ? endpoint : `${API_URL}${endpoint}`;
      
      console.log(`Making request to: ${url}${retries > 0 ? ` (retry ${retries}/${maxRetries})` : ''}`);
      
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
      
      // Don't retry if it's an API error (e.g., 400, 401, 403, etc.)
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Check if we should retry
      if (isRetryableError(error) && retries < maxRetries) {
        retries++;
        const delay = DEFAULT_RETRY_DELAY * Math.pow(2, retries - 1); // Exponential backoff
        console.log(`Retrying in ${delay}ms... (${retries}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      
      // If we've exhausted retries or it's not a retryable error
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
}

/**
 * Check if the API is reachable
 * @returns Promise that resolves to true if API is reachable, false otherwise
 */
export async function checkApiReachability(endpoint: string = '/health', timeout: number = 5000): Promise<boolean> {
  try {
    // Use AbortController to implement timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Use a simple HEAD request to minimize data transfer
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      // No auth headers needed for a basic reachability check
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API reachability check failed:', error);
    return false;
  }
}

/**
 * API client with methods for different HTTP verbs
 */
export const api = {
  /**
   * Check if the API is reachable
   */
  isReachable: (endpoint?: string, timeout?: number) => checkApiReachability(endpoint, timeout),
  
  /**
   * Make a GET request to the API
   */
  get: <T>(endpoint: string, maxRetries?: number) => 
    request<T>(endpoint, { method: 'GET' }, maxRetries),
  
  /**
   * Make a POST request to the API with JSON data
   */
  post: <T>(endpoint: string, data: any, maxRetries?: number) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include', // Include credentials for cross-origin requests
    }, maxRetries),
  
  /**
   * Make a PUT request to the API with JSON data
   */
  put: <T>(endpoint: string, data: any, maxRetries?: number) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      credentials: 'include', // Include credentials for cross-origin requests
    }, maxRetries),
  
  /**
   * Make a DELETE request to the API
   */
  delete: <T>(endpoint: string, maxRetries?: number) => 
    request<T>(endpoint, { 
      method: 'DELETE',
      credentials: 'include', // Include credentials for cross-origin requests
    }, maxRetries),
};
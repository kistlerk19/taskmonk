/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Parse API error response
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return new ApiError(
      data.message || response.statusText || 'API Error',
      response.status,
      data
    );
  } catch (error) {
    return new ApiError(
      response.statusText || 'API Error',
      response.status
    );
  }
}
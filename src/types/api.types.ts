// Contact form types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactApiResponse {
  success: boolean;
  error?: string;
}

// API error types
export interface ApiError {
  error: string;
  statusCode?: number;
}

// Download API types
export interface DownloadRequest {
  filename: string;
  locale?: string;
}

export interface DownloadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
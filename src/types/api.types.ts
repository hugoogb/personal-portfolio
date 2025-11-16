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

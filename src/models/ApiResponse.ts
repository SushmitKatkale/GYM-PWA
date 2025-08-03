export interface SuccessResponse {
  success: true;
  message: string;
  data?: any;
}

export interface FailureResponse {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse = SuccessResponse | FailureResponse;

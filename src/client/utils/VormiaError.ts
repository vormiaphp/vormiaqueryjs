import { AxiosResponse } from 'axios';

export class VormiaError extends Error {
  public status?: number;
  public response?: AxiosResponse;
  public code?: string;
  public data?: any;

  constructor(message: string, status?: number, response?: AxiosResponse, code?: string) {
    super(message);
    this.name = 'VormiaError';
    this.status = status;
    this.response = response;
    this.code = code;
    this.data = response?.data;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VormiaError);
    }
  }

  public isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || !this.status;
  }

  public isServerError(): boolean {
    return Boolean(this.status && this.status >= 500);
  }

  public isClientError(): boolean {
    return Boolean(this.status && this.status >= 400 && this.status < 500);
  }

  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  public isForbidden(): boolean {
    return this.status === 403;
  }

  public isNotFound(): boolean {
    return this.status === 404;
  }

  public isValidationError(): boolean {
    return this.status === 422;
  }

  public getValidationErrors(): Record<string, string[]> | null {
    if (this.isValidationError() && this.data?.errors) {
      return this.data.errors;
    }
    return null;
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      data: this.data,
      stack: this.stack,
    };
  }
}
/**
 * Custom error class for Vormia API errors
 * @class
 * @extends Error
 */
export class VormiaError extends Error {
  /**
   * Create a VormiaError
   * @param {string} message - The error message
   * @param {number} [status] - HTTP status code
   * @param {Object} [response] - The response object
   * @param {string} [code] - Error code
   */
  constructor(message, status, response, code) {
    super(message);
    this.name = 'VormiaError';
    this.status = status || (response && response.status);
    this.response = response;
    this.code = code;
    this.data = response && response.data;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VormiaError);
    }
  }

  /**
   * Check if the error is a network error
   * @returns {boolean}
   */
  isNetworkError() {
    return this.code === 'NETWORK_ERROR' || !this.status;
  }

  /**
   * Check if the error is a server error (5xx)
   * @returns {boolean}
   */
  isServerError() {
    return !!(this.status && this.status >= 500);
  }

  /**
   * Check if the error is a client error (4xx)
   * @returns {boolean}
   */
  isClientError() {
    return !!(this.status && this.status >= 400 && this.status < 500);
  }

  /**
   * Check if the error is an authentication error (401)
   * @returns {boolean}
   */
  isUnauthenticated() {
    return this.status === 401;
  }

  /**
   * Check if the error is an authorization error (403)
   * @returns {boolean}
   */
  isUnauthorized() {
    return this.status === 403;
  }

  /**
   * Check if the error is a not found error (404)
   * @returns {boolean}
   */
  isNotFound() {
    return this.status === 404;
  }

  /**
   * Check if the error is a validation error (422)
   * @returns {boolean}
   */
  isValidationError() {
    return this.status === 422;
  }

  /**
   * Get the error message from the response data
   * @returns {string} The error message
   */
  getErrorMessage() {
    if (this.data) {
      if (typeof this.data === 'string') return this.data;
      if (this.data.message) return this.data.message;
      if (this.data.error) return this.data.error;
      if (Array.isArray(this.data.errors)) return this.data.errors[0]?.message || this.message;
    }
    return this.message || 'An unknown error occurred';
  }

  /**
   * Get validation errors if this is a validation error
   * @returns {Object|null} Validation errors or null if not a validation error
   */
  getValidationErrors() {
    if (this.status === 422 && this.data && typeof this.data === 'object') {
      return this.data.errors || this.data;
    }
    return null;
  }
}

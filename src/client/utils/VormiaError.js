/**
 * Custom error class for Vormia API errors
 * @class
 * @extends Error
 */
export class VormiaError extends Error {
  /**
   * Create a VormiaError
   * @param {string|Object} message - The error message or error response object
   * @param {number} [status] - HTTP status code
   * @param {Object} [response] - The full response object
   * @param {string} [code] - Error code
   */
  constructor(message, status, response, code) {
    // Handle case where first argument is the response object
    let errorMessage = message;
    let errorResponse = response;
    let errorCode = code;
    let errorStatus = status;
    let errorData = null;
    let errorDebug = null;

    if (message && typeof message === 'object') {
      errorResponse = message;
      errorMessage = message.message || 'An error occurred';
      errorStatus = message.status || status;
      errorCode = message.code || code;
      errorData = message.data;
      errorDebug = message.debug;
    } else if (response && response.data) {
      errorData = response.data;
      if (typeof response.data === 'object') {
        errorMessage = response.data.message || errorMessage;
        errorDebug = response.data.debug;
      }
    }

    super(errorMessage);
    this.name = 'VormiaError';
    this.status = errorStatus || (errorResponse && errorResponse.status);
    this.response = errorResponse;
    this.code = errorCode;
    this.data = errorData;
    this.debug = errorDebug;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VormiaError);
    }
  }

  /**
   * Get a user-friendly error message
   * @returns {string}
   */
  getUserMessage() {
    // Default to development mode if we can't determine the environment
    const isProduction = (() => {
      try {
        // Check for Node.js environment
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
          return process.env.NODE_ENV === 'production';
        }
        // Check for browser environment with Vite/Webpack injected variable
        if (typeof import.meta !== 'undefined' && import.meta.env) {
          return import.meta.env.PROD === true;
        }
        // Check for browser environment with custom __ENV__
        if (typeof window !== 'undefined' && window.__ENV__?.NODE_ENV) {
          return window.__ENV__.NODE_ENV === 'production';
        }
      } catch {
        // If any error occurs, assume development
        return false;
      }
      // Default to development if we can't determine
      return false;
    })();
    
    if (isProduction) {
      return this.message || 'An unexpected error occurred. Please try again later.';
    }
    
    // In development, include more details
    if (this.isDatabaseError()) {
      return `Database error: ${this.getDatabaseErrorMessage()}`;
    }
    
    return this.message || 'An error occurred';
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
   * Check if the error is a database error
   * @returns {boolean}
   */
  isDatabaseError() {
    return (
      (this.message && this.message.includes('SQLSTATE')) ||
      (this.debug && this.debug.message && this.debug.message.includes('SQLSTATE'))
    );
  }

  /**
   * Extract a clean database error message
   * @returns {string}
   * @private
   */
  getDatabaseErrorMessage() {
    const errorSource = this.debug?.message || this.message || '';
    
    // Extract the main error message (part after the last colon)
    const parts = errorSource.split(':');
    const cleanMessage = parts[parts.length - 1].trim();
    
    // Map common database errors to user-friendly messages
    if (errorSource.includes('foreign key constraint fails')) {
      return 'A referenced record does not exist. Please check your input.';
    }
    if (errorSource.includes('duplicate entry')) {
      return 'This record already exists with the provided details.';
    }
    if (errorSource.includes('cannot be null')) {
      const field = errorSource.match(/Column '([^']+)'/i);
      return field ? `The field '${field[1]}' is required.` : 'A required field is missing.';
    }
    
    return cleanMessage || 'A database error occurred.';
  }

  /**
   * Get debug information for developers
   * @returns {Object}
   */
  getDebugInfo() {
    // Use the same environment detection as getUserMessage
    const isProduction = (() => {
      try {
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
          return process.env.NODE_ENV === 'production';
        }
        if (typeof import.meta !== 'undefined' && import.meta.env) {
          return import.meta.env.PROD === true;
        }
        if (typeof window !== 'undefined' && window.__ENV__?.NODE_ENV) {
          return window.__ENV__.NODE_ENV === 'production';
        }
      } catch {
        return false;
      }
      return false;
    })();
    
    if (isProduction) {
      return { error: 'Debug information is not available in production' };
    }

    return {
      message: this.message,
      status: this.status,
      code: this.code,
      timestamp: this.timestamp,
      debug: this.debug,
      stack: this.stack,
      response: this.response
    };
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

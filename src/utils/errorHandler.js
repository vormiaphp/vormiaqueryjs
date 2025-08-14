/**
 * Enhanced Error Handling Utilities for VormiaQueryJS
 * Focuses on standard API response format: { success, message, data, debug }
 */

/**
 * Creates a chainable error handler for easy error type checking and data retrieval
 * @param {VormiaError} error - The VormiaError instance
 * @returns {Object} Chainable error handler
 */
export function createErrorHandler(error) {
  return {
    // Check error types
    isValidationError: () => error.isValidationError(),
    isUnauthenticated: () => error.isUnauthenticated(),
    isServerError: () => error.isServerError(),
    isNetworkError: () => error.isNetworkError(),
    isNotFound: () => error.isNotFound(),
    isDatabaseError: () => error.isDatabaseError(),
    
    // Get API response data
    getApiResponse: () => error.response?.data || error.data,
    getApiMessage: () => {
      const apiResponse = error.response?.data || error.data;
      return apiResponse?.message || error.message;
    },
    getApiData: () => {
      const apiResponse = error.response?.data || error.data;
      return apiResponse?.data;
    },
    getApiDebug: () => {
      const apiResponse = error.response?.data || error.data;
      return apiResponse?.debug;
    },
    getApiSuccess: () => {
      const apiResponse = error.response?.data || error.data;
      return apiResponse?.success;
    },
    
    // Get user-friendly messages
    getUserMessage: () => error.getUserMessage(),
    getErrorMessage: () => error.getErrorMessage(),
    
    // Get validation errors
    getValidationErrors: () => error.getValidationErrors(),
    
    // Get error details
    getStatus: () => error.status,
    getCode: () => error.code,
    getResponse: () => error.response,
    
    // Chainable methods for common patterns
    ifValidationError: (callback) => {
      if (error.isValidationError()) {
        callback(this);
      }
      return this;
    },
    
    ifServerError: (callback) => {
      if (error.isServerError()) {
        callback(this);
      }
      return this;
    },
    
    ifNetworkError: (callback) => {
      if (error.isNetworkError()) {
        callback(this);
      }
      return this;
    },
    
    ifUnauthenticated: (callback) => {
      if (error.isUnauthenticated()) {
        callback(this);
      }
      return this;
    },
    
    // Log error details for debugging
    logDebug: (label = 'Error Debug') => {
      const apiResponse = error.response?.data || error.data;
      console.group(`🚨 ${label}`);
      console.log('Status:', error.status);
      console.log('Code:', error.code);
      console.log('Message:', error.message);
      console.log('API Response:', apiResponse);
      if (apiResponse?.debug) {
        console.log('API Debug:', apiResponse.debug);
      }
      console.groupEnd();
      return this;
    }
  };
}

/**
 * Object-based error handler for common error scenarios
 * @param {VormiaError} error - The VormiaError instance
 * @returns {Object} Error handler with common methods
 */
export function handleError(error) {
  const apiResponse = error.response?.data || error.data;
  
  return {
    // Basic error info
    status: error.status,
    code: error.code,
    message: error.message,
    
    // API response data
    apiResponse,
    apiMessage: apiResponse?.message || error.message,
    apiData: apiResponse?.data,
    apiDebug: apiResponse?.debug,
    apiSuccess: apiResponse?.success,
    
    // Error type checks
    isValidationError: error.isValidationError(),
    isUnauthenticated: error.isUnauthenticated(),
    isServerError: error.isServerError(),
    isNetworkError: error.isNetworkError(),
    isNotFound: error.isNotFound(),
    isDatabaseError: error.isDatabaseError(),
    
    // User messages
    userMessage: error.getUserMessage(),
    errorMessage: error.getErrorMessage(),
    
    // Validation errors
    validationErrors: error.getValidationErrors(),
    
    // Debug logging
    logDebug: (label = 'Error Details') => {
      console.group(`🚨 ${label}`);
      console.log('Status:', error.status);
      console.log('Code:', error.code);
      console.log('Message:', error.message);
      console.log('API Response:', apiResponse);
      if (apiResponse?.debug) {
        console.log('API Debug:', apiResponse.debug);
      }
      console.groupEnd();
    }
  };
}

/**
 * Creates a toast error handler that automatically displays toast messages
 * @param {Object} toast - Toast function from your UI library
 * @param {Object} options - Configuration options
 * @returns {Function} Error handler function
 */
export function createToastErrorHandler(toast, options = {}) {
  const {
    showValidationErrors = true,
    showServerErrors = true,
    showNetworkErrors = true,
    showAuthErrors = true,
    defaultMessages = {}
  } = options;
  
  return (error) => {
    const apiResponse = error.response?.data || error.data;
    const apiMessage = apiResponse?.message || error.message;
    
    if (error.isValidationError() && showValidationErrors) {
      toast({
        title: defaultMessages.validationTitle || "Validation Error",
        description: apiMessage || defaultMessages.validationMessage || "Please check the form fields below.",
        variant: "destructive"
      });
    } else if (error.isUnauthenticated() && showAuthErrors) {
      toast({
        title: defaultMessages.authTitle || "Authentication Error",
        description: apiMessage || defaultMessages.authMessage || "Authentication failed. Please try again.",
        variant: "destructive"
      });
    } else if (error.isServerError() && showServerErrors) {
      toast({
        title: defaultMessages.serverTitle || "Server Error",
        description: apiMessage || defaultMessages.serverMessage || "Server error. Please try again later.",
        variant: "destructive"
      });
    } else if (error.isNetworkError() && showNetworkErrors) {
      toast({
        title: defaultMessages.networkTitle || "Network Error",
        description: apiMessage || defaultMessages.networkMessage || "Network error. Please check your connection.",
        variant: "destructive"
      });
    } else {
      toast({
        title: defaultMessages.defaultTitle || "Error",
        description: apiMessage || defaultMessages.defaultMessage || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
    
    // Return error handler for additional processing
    return handleError(error);
  };
}

/**
 * Creates a form-specific error handler
 * @param {Object} options - Configuration options
 * @returns {Function} Form error handler function
 */
export function createFormErrorHandler(options = {}) {
  const {
    setFieldErrors,
    setGeneralError,
    fieldMapping = {},
    showToasts = true,
    toast
  } = options;
  
  return (error) => {
    const apiResponse = error.response?.data || error.data;
    const apiMessage = apiResponse?.message || error.message;
    
    if (error.isValidationError() && setFieldErrors) {
      const validationErrors = error.getValidationErrors();
      const newFieldErrors = {};
      
      // Map validation errors to form fields
      Object.keys(validationErrors).forEach(field => {
        const mappedField = fieldMapping[field] || field;
        if (mappedField) {
          newFieldErrors[mappedField] = validationErrors[field];
        }
      });
      
      setFieldErrors(newFieldErrors);
      if (setGeneralError) setGeneralError('');
      
      if (showToasts && toast) {
        toast({
          title: "Validation Error",
          description: apiMessage || "Please check the form fields below.",
          variant: "destructive"
        });
      }
    } else {
      // Clear field errors for non-validation errors
      if (setFieldErrors) setFieldErrors({});
      
      // Set general error
      if (setGeneralError) {
        setGeneralError(apiMessage || "An error occurred. Please try again.");
      }
      
      if (showToasts && toast) {
        toast({
          title: "Error",
          description: apiMessage || "An error occurred. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    // Return error handler for additional processing
    return handleError(error);
  };
}

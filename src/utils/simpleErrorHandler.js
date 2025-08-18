/**
 * Simple Error Handler Utilities for VormiaQueryJS
 * Provides clean, simple error handling without complex logic
 */

/**
 * Extract clean error information from VormiaQueryJS errors
 * @param {VormiaError} error - The VormiaError instance
 * @returns {Object} Clean error information
 */
export function extractErrorInfo(error) {
  // Extract API response data - note: error.response.data is the actual API response
  const apiResponse = error.response?.data;
  const apiMessage = apiResponse?.message || error.message;

  // Determine error type
  let errorType = "unknown";
  if (error.isValidationError?.()) errorType = "validation";
  else if (error.isUnauthenticated?.()) errorType = "unauthenticated";
  else if (error.isServerError?.()) errorType = "server";
  else if (error.isNetworkError?.()) errorType = "network";

  return {
    status: error.status || 0,
    message: error.message || "Unknown error",
    response: apiResponse || {},
    errorType,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle validation errors with field mapping
 * @param {VormiaError} error - The VormiaError instance
 * @param {Function} setFieldErrors - Function to set field errors
 * @param {Object} fieldMapping - Mapping of backend fields to form fields
 * @param {Function} toast - Toast function (optional)
 */
export function handleValidationError(
  error,
  setFieldErrors,
  fieldMapping = {},
  toast = null
) {
  const validationErrors = error.getValidationErrors?.() || {};
  const apiResponse = error.response?.data;
  const apiMessage =
    apiResponse?.message || "Please check the form fields below.";

  // Map validation errors to form fields
  const newFieldErrors = {};
  Object.keys(validationErrors).forEach((field) => {
    const mappedField = fieldMapping[field] || field;
    if (mappedField) {
      newFieldErrors[mappedField] = validationErrors[field];
    }
  });

  setFieldErrors(newFieldErrors);

  // Show toast if provided
  if (toast) {
    toast({
      title: "Validation Error",
      description: apiMessage,
      variant: "destructive",
    });
  }
}

/**
 * Handle general errors (non-validation)
 * @param {VormiaError} error - The VormiaError instance
 * @param {Function} setGeneralError - Function to set general error
 * @param {Function} toast - Toast function (optional)
 */
export function handleGeneralError(error, setGeneralError, toast = null) {
  const apiResponse = error.response?.data;
  const apiMessage =
    apiResponse?.message || "An error occurred. Please try again.";

  setGeneralError(apiMessage);

  // Show appropriate toast if provided
  if (toast) {
    let title = "Error";
    if (error.isValidationError?.()) title = "Validation Error";
    else if (error.isUnauthenticated?.()) title = "Authentication Error";
    else if (error.isServerError?.()) title = "Server Error";
    else if (error.isNetworkError?.()) title = "Network Error";

    toast({
      title,
      description: apiMessage,
      variant: "destructive",
    });
  }
}

/**
 * Simple error handler that combines all utilities
 * @param {VormiaError} error - The VormiaError instance
 * @param {Object} options - Handler options
 * @returns {Object} Error information and handler functions
 */
export function createSimpleErrorHandler(error, options = {}) {
  const {
    setFieldErrors,
    setGeneralError,
    fieldMapping = {},
    toast = null,
    showToasts = true,
  } = options;

  const errorInfo = extractErrorInfo(error);

  // Handle validation errors
  if (error.isValidationError?.() && setFieldErrors) {
    handleValidationError(
      error,
      setFieldErrors,
      fieldMapping,
      showToasts ? toast : null
    );
    if (setGeneralError) setGeneralError("");
  } else {
    // Handle general errors
    if (setFieldErrors) setFieldErrors({});
    if (setGeneralError) {
      handleGeneralError(error, setGeneralError, showToasts ? toast : null);
    }
  }

  return {
    errorInfo,
    // Convenience methods
    isValidation: () => error.isValidationError?.(),
    isAuth: () => error.isUnauthenticated?.(),
    isServer: () => error.isServerError?.(),
    isNetwork: () => error.isNetworkError?.(),
    // Get API data
    getApiMessage: () => errorInfo.response?.message || error.message,
    getApiDebug: () => errorInfo.response?.debug,
    getApiData: () => errorInfo.response?.data,
  };
}

/**
 * Simple debug logging utility
 * @param {VormiaError} error - The VormiaError instance
 * @param {string} label - Label for the console group
 */
export function logErrorForDebug(error, label = "API Error") {
  const apiResponse = error.response?.data;

  console.group(`🚨 ${label}`);
  console.log("Status:", error.status);
  console.log("Message:", error.message);
  console.log("API Response:", apiResponse);

  if (apiResponse?.debug) {
    console.log("API Debug:", apiResponse.debug);
  }
  console.groupEnd();
}

/**
 * Enhanced Error Handler for VormiaQueryJS
 * Based on the working implementation from code_usage project
 */

/**
 * Handle API errors and extract useful information
 * @param {Object} error - Vormia error object
 * @returns {Object} Structured error information
 */
export function handleApiError(error) {
  // Extract API response data - note: error.response is the actual API response
  const apiResponse = error.response;
  // Note: apiMessage calculated but not used in this function
  // const apiMessage =
  //   apiResponse?.message ||
  //   apiResponse?.response?.data?.message ||
  //   error.message;

  // Determine error type
  let errorType = "unknown";
  if (error.isValidationError?.()) errorType = "Api Response";
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
 * Handle field-specific errors from API response
 * @param {Object} error - Vormia error object
 * @param {Function} setFieldErrors - Function to set field errors
 * @param {Object} fieldMappings - Custom field name mappings
 */
export function handleFieldErrors(error, setFieldErrors, fieldMappings = {}) {
  // Extract field errors from API response
  const apiResponse = error.response;
  // Check both direct access and nested access for field errors
  const fieldErrors =
    apiResponse?.errors || apiResponse?.response?.data?.errors || {};
  const apiMessage =
    apiResponse?.message ||
    apiResponse?.response?.data?.message ||
    "Please check the form fields below.";

  // Map field errors to form fields - combine all error messages
  const newFieldErrors = {};
  Object.keys(fieldErrors).forEach((field) => {
    // Use custom field mapping if available
    const mappedField = fieldMappings[field] || field;

    if (mappedField === "password_confirmation") {
      // Join all error messages for password_confirmation field
      newFieldErrors.confirmPassword = fieldErrors[field].join("; ");
    } else {
      // Join all error messages for other fields
      newFieldErrors[mappedField] = fieldErrors[field].join("; ");
    }
  });

  setFieldErrors(newFieldErrors);

  return {
    fieldErrors: newFieldErrors,
    message: apiMessage,
  };
}

/**
 * Handle general (non-field-specific) errors
 * @param {Object} error - Vormia error object
 * @param {Function} setGeneralError - Function to set general error
 */
export function handleGeneralError(error, setGeneralError) {
  const apiResponse = error.response;
  const apiMessage =
    apiResponse?.message ||
    apiResponse?.response?.data?.message ||
    "An error occurred. Please try again.";

  setGeneralError(apiMessage);

  return {
    message: apiMessage,
    errorType: error.isUnauthenticated?.()
      ? "Authentication Error"
      : error.isServerError?.()
      ? "Server Error"
      : error.isNetworkError?.()
      ? "Network Error"
      : "Error",
  };
}

/**
 * Log errors for debugging when debug mode is enabled
 * @param {Object} error - Vormia error object
 * @param {string} label - Label for the error log
 */
export function logErrorForDebug(error, label = "API Error") {
  // Check if debug is enabled via environment variable
  const isDebugEnabled = getDebugFlag();

  if (!isDebugEnabled) {
    return; // Exit early if debug is disabled
  }

  const apiResponse = error.response;

  console.group(`🚨 ${label}`);
  console.log("Status:", error.status);
  console.log("Message:", error.message);

  // Format output to match API JSON structure
  if (apiResponse?.response?.data) {
    const apiData = apiResponse.response.data;
    console.log("Success:", apiData.success);
    if (apiData.errors) {
      console.log("Errors:", apiData.errors);
    }
    if (apiData.data) {
      console.log("Data:", apiData.data);
    }
    if (apiData.debug) {
      console.log("Debug:", apiData.debug);
    }
  }

  // Full API Response dump
  console.log("Full API Response:", apiResponse);
  console.groupEnd();
}

/**
 * Log success responses for debugging when debug mode is enabled
 * @param {Object} response - API response
 * @param {string} label - Label for the success log
 */
export function logSuccessForDebug(response, label = "API Success") {
  // Check if debug is enabled via environment variable
  const isDebugEnabled = getDebugFlag();

  if (!isDebugEnabled) {
    return; // Exit early if debug is disabled
  }

  console.group(`✅ ${label}`);

  // Format output to match API JSON structure
  // Check if this is a processed response (has message, status) or original API response
  const isProcessedResponse = response.message !== undefined && response.status !== undefined;
  const isOriginalApiResponse = response.success !== undefined;
  
  if (isProcessedResponse) {
    // This is a processed response from the client
    console.log("Success:", true); // If we got here, it was successful
    console.log("Message:", response.message);
    if (response.data) {
      console.log("Data:", response.data);
    }
    if (response.debug) {
      console.log("Debug:", response.debug);
    }
  } else if (isOriginalApiResponse) {
    // This is an original API response
    console.log("Success:", response.success);
    console.log("Message:", response.message);
    if (response.data) {
      console.log("Data:", response.data);
    }
    if (response.debug) {
      console.log("Debug:", response.debug);
    }
  } else if (response?.data) {
    // Fallback for other response structures
    const apiData = response.data;
    console.log("Success:", apiData.success);
    console.log("Message:", apiData.message);
    if (apiData.data) {
      console.log("Data:", apiData.data);
    }
    if (apiData.debug) {
      console.log("Debug:", apiData.debug);
    }
  }

  // Full API Response dump
  console.log("Full API Response:", response);
  console.groupEnd();
}

/**
 * Transform API response data based on success/failure
 * @param {Object} response - The API response
 * @returns {Object} Transformed data with proper structure
 */
export function transformApiResponse(response) {
  if (!response) return null;

  // Handle success response
  if (response.data?.success) {
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
      debug: response.data.debug,
    };
  }

  // Handle error response
  if (response.data?.success === false) {
    return {
      success: false,
      message: response.data.message,
      errors: response.data.errors,
      debug: response.data.debug,
    };
  }

  // Fallback
  return response;
}

/**
 * Get debug flag from environment variables
 * @returns {boolean} Whether debug mode is enabled
 */
export function getDebugFlag() {
  try {
    // Check for Vite environment variables first
    if (typeof import.meta !== "undefined" && import.meta.env) {
      // Check both VITE_ and PUBLIC_ prefixed variables
      const debugValue =
        import.meta.env.VITE_VORMIA_DEBUG ||
        import.meta.env.PUBLIC_VORMIA_DEBUG;

      if (debugValue !== undefined) {
        // If explicitly set to false, disable debug
        if (String(debugValue).toLowerCase() === "false") {
          console.log(
            "🔍 VormiaQuery Debug: Debug mode explicitly disabled via environment variable"
          );
          return false;
        }

        // If set to true or any other value, enable debug
        const isEnabled =
          String(debugValue).toLowerCase() === "true" || debugValue !== "";
        return isEnabled;
      }
    }

    // Check for global variable (as a fallback)
    if (
      typeof window !== "undefined" &&
      window.__VORMIA_DEBUG__ !== undefined
    ) {
      const isEnabled = Boolean(window.__VORMIA_DEBUG__);
      return isEnabled;
    }

    // Default: Debug is ENABLED unless explicitly disabled
    return true;
  } catch (error) {
    console.error("🔍 VormiaQuery Debug: Error checking debug flag:", error);
    // On error, default to enabled for safety
    return true;
  }
}

// Note: Notifications are always enabled by default
// This function is kept for backward compatibility but not actively used
export function getNotificationConfig() {
  return {
    toast: true, // Default to enabled, can be overridden per-query
    panel: true, // Default to enabled, can be overridden per-query
    duration: 5000, // Default duration
  };
}

/**
 * Get debug settings from environment variables
 * @returns {Object} Debug configuration
 */
export function getDebugConfig() {
  const debugEnabled = getDebugFlag();

  return {
    enabled: debugEnabled,
    isProduction: !debugEnabled, // If debug is disabled, treat as production
  };
}

/**
 * Check if current environment is production
 * @returns {boolean} Whether current environment is production
 */
export function isProduction() {
  // If debug is explicitly disabled, treat as production
  return getDebugFlag() === false;
}

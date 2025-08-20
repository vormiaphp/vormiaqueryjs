

/**
 * Error Debug Info Interface
 * @typedef {Object} ErrorDebugInfo
 * @property {number} status - HTTP status code
 * @property {string} message - Error message
 * @property {Object} response - API response data
 * @property {string} errorType - Type of error
 * @property {string} timestamp - Error timestamp
 */

/**
 * Error Debug Panel Component
 * Displays technical debug information for developers
 */
export function ErrorDebugPanel({
  debugInfo,
  showDebug,
  onClose,
  className = "",
}) {
  if (!showDebug || !debugInfo) return null;

  const { status, message, response, errorType, timestamp } = debugInfo;

  // Determine if this is a success or error response
  const isSuccess = response.response?.data?.success === true;
  const isError = response.response?.data?.success === false;

  return (
    <div className={`mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md ${className}`}>
      <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          {isSuccess
            ? "✅ Success Debug"
            : isError
            ? "🚨 Error Debug"
            : "🐛 Debug Info"}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close debug panel"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="space-y-3 text-xs">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div>
            <span className="font-medium text-gray-600">HTTP Status:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              status >= 500
                ? "bg-red-100 text-red-800"
                : status >= 400
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {status}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Error Type:</span>
            <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              {errorType}
            </span>
          </div>
        </div>
        
        {/* API Message */}
        <div>
          <span className="font-medium text-gray-600">API Message:</span>
          <p className="ml-2 text-gray-700 break-words bg-gray-100 p-2 rounded mt-1">
            {response.response?.data?.message || message}
          </p>
        </div>
        
        {/* Response Data - Only show the data key content for success responses */}
        {isSuccess && response.response?.data?.data && (
          <div>
            <span className="font-medium text-gray-600">📊 Response Data:</span>
            <pre className="ml-2 mt-1 p-2 rounded text-xs overflow-x-auto bg-gray-100 text-gray-700">
              {JSON.stringify(response.response.data.data, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Response Errors - Only show the errors key content for error responses */}
        {/* {isError && response.response?.data?.errors && ( */}
          <div>
            <span className="font-medium text-gray-600">🚨 Response Errors:</span>
            <pre className="ml-2 mt-1 p-2 rounded text-xs overflow-x-auto bg-red-500 text-white border border-red-200">
              {JSON.stringify(response.response)}
            </pre>
          </div>
        {/* )} */}
        
        {/* Special handling for validation errors - Formatted display */}
        {response.response?.data?.errors && (
          <div>
            <span className="font-medium text-gray-600">🚨 Validation Errors (Formatted):</span>
            <div className="ml-2 mt-1 p-2 rounded text-xs bg-red-500 border border-red-200">
              {Object.entries(response.response.data.errors).map(([field, messages]) => (
                <div key={field} className="mb-2">
                  <span className="font-medium text-red-700">{field}:</span>
                  <div className="ml-2">
                    {Array.isArray(messages) ? messages.map((msg, idx) => (
                      <div key={idx} className="text-red-600">• {msg}</div>
                    )) : (
                      <div className="text-red-600">• {messages}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Full Debug - Only show the debug key content */}
        {(response.response?.data?.debug || response.debug) && (
          <div>
            <span className="font-medium text-gray-600">🔍 Full Debug:</span>
            <pre className="ml-2 mt-1 p-2 rounded text-xs overflow-x-auto bg-blue-50 text-blue-700 border border-blue-200">
              {JSON.stringify(response.response?.data?.debug || response.debug, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Timestamp */}
        <div>
          <span className="font-medium text-gray-600">Timestamp:</span>
          <span className="ml-2 text-gray-700">
            {new Date(timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Check if debug mode should be enabled
 * @returns {boolean} Whether debug mode is enabled
 */
export function shouldShowDebug() {
  console.log("🔍 ErrorDebugPanel: Checking if debug should be shown...");
  
  // Check if debug is enabled via environment variable
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_VORMIA_DEBUG
  ) {
    const debugValue = import.meta.env.VITE_VORMIA_DEBUG;
    console.log("🔍 ErrorDebugPanel: VITE_VORMIA_DEBUG =", debugValue);
    const result = debugValue === "true";
    console.log("🔍 ErrorDebugPanel: Debug enabled =", result);
    return result;
  }

  // Next.js - safely check for process (only in Node.js environment)
  if (typeof window === "undefined" && typeof process !== "undefined") {
    try {
      // eslint-disable-next-line no-undef
      if (process?.env?.NEXT_PUBLIC_VORMIA_DEBUG) {
        // eslint-disable-next-line no-undef
        const debugValue = process.env.NEXT_PUBLIC_VORMIA_DEBUG;
        console.log("🔍 ErrorDebugPanel: NEXT_PUBLIC_VORMIA_DEBUG =", debugValue);
        const result = debugValue === "true";
        console.log("🔍 ErrorDebugPanel: Debug enabled =", result);
        return result;
      }
    } catch {
      // process not available, continue
    }
  }

  // Astro
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.PUBLIC_VORMIA_DEBUG
  ) {
    const debugValue = import.meta.env.PUBLIC_VORMIA_DEBUG;
    console.log("🔍 ErrorDebugPanel: PUBLIC_VORMIA_DEBUG =", debugValue);
    const result = debugValue === "true";
    console.log("🔍 ErrorDebugPanel: Debug enabled =", result);
    return result;
  }

  console.log("🔍 ErrorDebugPanel: No debug environment variable found, debug disabled");
  return false;
}

/**
 * Create debug info from API response or error
 * @param {Object} response - API response or error object
 * @returns {ErrorDebugInfo} Debug information object
 */
export function createDebugInfo(response) {
  // Handle error objects (from onError)
  if (response?.response) {
    // This is an error response
    const errorResponse = response.response;
    const errorData = errorResponse.data || {};
    
    // Preserve the original error response structure
    const responseData = {
      success: false,
      message: errorResponse.message || errorData.message || "Error occurred"
    };
    
    // Only add errors if they exist
    if (errorData.errors) {
      responseData.errors = errorData.errors;
    }
    
    // Only add debug if it exists
    if (errorData.debug) {
      responseData.debug = errorData.debug;
    }
    
    return {
      status: errorResponse.status || 0,
      message: errorResponse.message || errorData.message || "Error occurred",
      response: {
        response: {
          data: responseData,
          debug: errorResponse.debug
        },
        debug: errorResponse.debug
      },
      errorType: "api_error",
      timestamp: new Date().toISOString()
    };
  }
  
  // Handle success responses (from onSuccess)
  if (response?.data) {
    const isSuccess = response.data.success === true;
    
    // Preserve the original response structure
    const responseData = {
      success: response.data.success,
      message: response.data.message
    };
    
    // Only add data if it exists (for success responses)
    if (response.data.data) {
      responseData.data = response.data.data;
    }
    
    // Only add errors if they exist (for error responses)
    if (response.data.errors) {
      responseData.errors = response.data.errors;
    }
    
    // Only add debug if it exists
    if (response.data.debug) {
      responseData.debug = response.data.debug;
    }
    
    return {
      status: isSuccess ? 200 : response.status || 0,
      message: isSuccess
        ? "Operation successful"
        : response.data.message || "Unknown response",
      response: {
        response: {
          data: responseData,
          debug: response.debug
        },
        debug: response.debug
      },
      errorType: isSuccess ? "success" : "api_response",
      timestamp: new Date().toISOString()
    };
  }

  // Fallback for unknown response structure
  return {
    status: 0,
    message: "Unknown response structure",
    response: {
      response: {
        data: response,
        debug: null
      },
      debug: null
    },
    errorType: "unknown",
    timestamp: new Date().toISOString()
  };
}

/**
 * Create error debug panel HTML string (framework agnostic)
 * @param {ErrorDebugInfo} debugInfo - Debug information
 * @param {string} onCloseFunction - Function name to call on close
 * @returns {string} HTML string
 */
export function createErrorDebugHtml(
  debugInfo,
  onCloseFunction = "closeDebugPanel"
) {
  if (!debugInfo) return "";

  const { status, message, response, errorType, timestamp } = debugInfo;

  // Determine if this is a success or error response
  const isSuccess = response.response?.data?.success === true;
  const isError = response.response?.data?.success === false;

  const getStatusColor = () => {
    if (status >= 500) return "background-color: #fef2f2; color: #dc2626;";
    if (status >= 400) return "background-color: #fffbeb; color: #d97706;";
    return "background-color: #f3f4f6; color: #374151;";
  };

  const getResponseColor = () => {
    if (isSuccess)
      return "background-color: #f0fdf4; border: 1px solid #bbf7d0;";
    if (isError) return "background-color: #fef2f2; border: 1px solid #fecaca;";
    return "background-color: #f3f4f6;";
  };

  const getResponseTitle = () => {
    if (isSuccess) return "📊 Response Data:";
    if (isError) return "🚨 Response Errors:";
    return "📋 Response Info:";
  };

  const getResponseData = () => {
    if (isSuccess) return response.response?.data?.data;
    if (isError) return response.response?.data?.errors;
    return response.response?.data;
  };

  return `
    <div class="error-debug-panel" style="margin-top: 1.5rem; padding: 1rem; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 0.375rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">
        <h3 style="font-size: 0.875rem; font-weight: 600; color: #374151;">
          ${
            isSuccess
              ? "✅ Success Debug"
              : isError
              ? "🚨 Error Debug"
              : "🐛 Debug Info"
          }
        </h3>
        <button onclick="${onCloseFunction}()" style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1rem; padding: 0;" aria-label="Close debug panel">
          ✕
        </button>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.75rem;">
        <!-- Basic Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <div>
            <span style="font-weight: 500; color: #6b7280;">HTTP Status:</span>
            <span style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; ${getStatusColor()}">
              ${status}
            </span>
          </div>
          <div>
            <span style="font-weight: 500; color: #6b7280;">Error Type:</span>
            <span style="margin-left: 0.5rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; background-color: #dbeafe; color: #1d4ed8;">
              ${errorType}
            </span>
          </div>
        </div>
        
        <!-- API Message -->
        <div>
          <span style="font-weight: 500; color: #6b7280;">API Message:</span>
          <p style="margin-left: 0.5rem; color: #374151; word-break: break-word; background-color: #f3f4f6; padding: 0.5rem; border-radius: 0.25rem; margin-top: 0.25rem;">
            ${response.response?.data?.message || message}
          </p>
        </div>
        
        <!-- Response Info -->
        ${
          response.response?.data
            ? `
          <div>
            <span style="font-weight: 500; color: #6b7280;">${getResponseTitle()}</span>
            <pre style="margin-left: 0.5rem; margin-top: 0.25rem; padding: 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; overflow-x: auto; ${getResponseColor()}">
              ${JSON.stringify(getResponseData(), null, 2)}
            </pre>
          </div>
        `
            : ""
        }
        
        <!-- Debug Info -->
        ${
          response.debug || response.response?.data?.debug
            ? `
          <div>
            <span style="font-weight: 500; color: #6b7280;">🔍 Debug Info:</span>
            <pre style="margin-left: 0.5rem; margin-top: 0.25rem; padding: 0.5rem; background-color: #f3f4f6; border-radius: 0.25rem; font-size: 0.75rem; overflow-x: auto; max-height: 8rem;">
              ${JSON.stringify(
                response.debug || response.response?.data?.debug,
                null,
                2
              )}
            </pre>
          </div>
        `
            : ""
        }
        
        <div style="color: #6b7280; font-size: 0.75rem;">
          ${timestamp}
        </div>
      </div>
    </div>
  `;
}

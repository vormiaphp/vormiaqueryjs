/**
 * Enhanced Error Handler for VormiaQueryJS
 * Integrates with ErrorDebugPanel, NotificationPanel, and fieldErrors
 * Framework-agnostic and provides comprehensive error handling
 */

import { createErrorHandler } from "./errorHandler.js";
import {
  createErrorDebugPanel,
  removeErrorDebugPanel,
} from "../components/ErrorDebugPanel.js";
import {
  showNotification,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} from "../components/NotificationPanel.js";
import {
  createFieldErrorManager,
  processApiFieldErrors,
} from "./fieldErrors.js";

/**
 * Enhanced error handler that integrates all components
 */
export class EnhancedErrorHandler {
  constructor(options = {}) {
    this.options = {
      debugEnabled: this.isDebugEnabled(),
      showNotifications: true,
      showDebugPanel: true,
      autoHideNotifications: true,
      notificationTarget: "body",
      debugTarget: null,
      ...options,
    };

    this.debugPanel = null;
    this.fieldErrorManager = createFieldErrorManager();
    this.notificationHistory = [];
    this.errorHistory = [];
  }

  /**
   * Check if debug mode is enabled via environment variable
   * @returns {boolean} True if debug is enabled
   */
  isDebugEnabled() {
    // Check for Vite environment variable
    if (typeof import.meta !== "undefined" && import.meta.env) {
      return import.meta.env.VITE_VORMIA_DEBUG === "true";
    }

    // Check for Node.js environment variable
    if (typeof process !== "undefined" && process.env) {
      return process.env.VITE_VORMIA_DEBUG === "true";
    }

    // Check for browser environment variable
    if (typeof window !== "undefined" && window.VITE_VORMIA_DEBUG) {
      return window.VITE_VORMIA_DEBUG === "true";
    }

    return false;
  }

  /**
   * Handle API success response
   * @param {Object} response - API response data
   * @param {Object} options - Additional options
   */
  handleSuccess(response, options = {}) {
    const {
      showNotification: showNotif = this.options.showNotifications,
      showDebugPanel: showDebug = this.options.showDebugPanel,
      notificationMessage = null,
      debugLabel = "API Success",
    } = options;

    // Log success for debugging
    this.logSuccessForDebug(response, debugLabel);

    // Show success notification
    if (showNotif) {
      const message =
        notificationMessage ||
        response?.data?.message ||
        "Operation completed successfully.";

      showSuccessNotification(
        message,
        "Success!",
        this.options.notificationTarget,
        this.options.autoHideNotifications ? 3000 : 0
      );
    }

    // Show debug panel if enabled
    if (showDebug && this.options.debugEnabled) {
      this.showDebugPanel({
        status: 200,
        message: "Operation successful",
        response: {
          response: {
            data: {
              success: true,
              message:
                response?.data?.message || "Operation completed successfully",
              data: response?.data,
              debug: response?.debug,
            },
          },
          debug: response?.debug,
        },
        errorType: "success",
        timestamp: new Date().toISOString(),
      });
    }

    // Clear any existing errors
    this.fieldErrorManager.clearAllFieldErrors();
    this.removeDebugPanel();

    return response;
  }

  /**
   * Handle API error response
   * @param {Object} error - VormiaQueryJS error object
   * @param {Object} options - Additional options
   */
  handleError(error, options = {}) {
    const {
      showNotification: showNotif = this.options.showNotifications,
      showDebugPanel: showDebug = this.options.showDebugPanel,
      handleFieldErrors = true,
      fieldMapping = {},
      customErrorHandler = null,
    } = options;

    // Get clean error info
    const errorInfo = this.createErrorInfo(error);
    this.errorHistory.push(errorInfo);

    // Log for debugging
    this.logErrorForDebug(error, "API Error");

    // Show debug panel if enabled
    if (showDebug && this.options.debugEnabled) {
      this.showDebugPanel(errorInfo);
    }

    // Handle field errors if requested
    if (handleFieldErrors) {
      this.handleFieldErrors(error, fieldMapping);
    }

    // Show error notification
    if (showNotif) {
      const message =
        errorInfo.message || "An error occurred. Please try again.";
      const title = this.getErrorTitle(error);

      showErrorNotification(
        message,
        title,
        this.options.notificationTarget,
        0 // Don't auto-hide error notifications
      );
    }

    // Call custom error handler if provided
    if (customErrorHandler && typeof customErrorHandler === "function") {
      customErrorHandler(error, errorInfo);
    }

    return errorInfo;
  }

  /**
   * Create standardized error info object
   * @param {Object} error - VormiaQueryJS error object
   * @returns {Object} Standardized error info
   */
  createErrorInfo(error) {
    const apiResponse = error.response;
    const apiMessage =
      apiResponse?.message ||
      apiResponse?.response?.data?.message ||
      error.message;

    // Determine error type
    let errorType = "unknown";
    if (error.isValidationError && error.isValidationError())
      errorType = "validation";
    else if (error.isUnauthenticated && error.isUnauthenticated())
      errorType = "unauthenticated";
    else if (error.isServerError && error.isServerError()) errorType = "server";
    else if (error.isNetworkError && error.isNetworkError())
      errorType = "network";
    else if (error.isNotFound && error.isNotFound()) errorType = "not_found";
    else if (error.isDatabaseError && error.isDatabaseError())
      errorType = "database";

    return {
      status: error.status || 0,
      message: error.message || "Unknown error",
      response: apiResponse || {},
      errorType,
      timestamp: new Date().toISOString(),
      originalError: error,
    };
  }

  /**
   * Get appropriate error title based on error type
   * @param {Object} error - VormiaQueryJS error object
   * @returns {string} Error title
   */
  getErrorTitle(error) {
    if (error.isUnauthenticated && error.isUnauthenticated())
      return "Authentication Error";
    if (error.isServerError && error.isServerError()) return "Server Error";
    if (error.isNetworkError && error.isNetworkError()) return "Network Error";
    if (error.isValidationError && error.isValidationError())
      return "Validation Error";
    if (error.isNotFound && error.isNotFound()) return "Not Found";
    if (error.isDatabaseError && error.isDatabaseError())
      return "Database Error";
    return "Error";
  }

  /**
   * Handle field-level errors
   * @param {Object} error - VormiaQueryJS error object
   * @param {Object} fieldMapping - Mapping of API field names to form field names
   */
  handleFieldErrors(error, fieldMapping = {}) {
    const fieldErrors = processApiFieldErrors(error, fieldMapping);

    if (Object.keys(fieldErrors).length > 0) {
      this.fieldErrorManager.setFieldErrors(fieldErrors);

      // Show field error notification
      if (this.options.showNotifications) {
        const message =
          error.response?.message ||
          error.response?.response?.data?.message ||
          "Please check the form fields below.";

        showWarningNotification(
          message,
          "Field Errors",
          this.options.notificationTarget,
          5000
        );
      }
    }
  }

  /**
   * Show debug panel
   * @param {Object} debugInfo - Debug information
   */
  showDebugPanel(debugInfo) {
    if (!this.options.debugEnabled) return;

    // Remove existing debug panel
    this.removeDebugPanel();

    // Create new debug panel
    this.debugPanel = createErrorDebugPanel({
      debugInfo,
      showDebug: true,
      onClose: () => this.removeDebugPanel(),
      targetSelector: this.options.debugTarget,
    });
  }

  /**
   * Remove debug panel
   */
  removeDebugPanel() {
    if (this.debugPanel) {
      removeErrorDebugPanel(this.debugPanel);
      this.debugPanel = null;
    }
  }

  /**
   * Log error for debugging
   * @param {Object} error - VormiaQueryJS error object
   * @param {string} label - Label for the log
   */
  logErrorForDebug(error, label = "API Error") {
    if (!this.options.debugEnabled) return;

    const apiResponse = error.response;
    const apiMessage =
      apiResponse?.message ||
      apiResponse?.response?.data?.message ||
      error.message;

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
   * Log success for debugging
   * @param {Object} response - API response
   * @param {string} label - Label for the log
   */
  logSuccessForDebug(response, label = "API Success") {
    if (!this.options.debugEnabled) return;

    console.group(`✅ ${label}`);

    // Format output to match API JSON structure
    if (response?.data) {
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
   * Get field error manager
   * @returns {FieldErrorManager} Field error manager instance
   */
  getFieldErrorManager() {
    return this.fieldErrorManager;
  }

  /**
   * Get error history
   * @returns {Array} Array of error history entries
   */
  getErrorHistory() {
    return [...this.errorHistory];
  }

  /**
   * Get notification history
   * @returns {Array} Array of notification history entries
   */
  getNotificationHistory() {
    return [...this.notificationHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = [];
  }

  /**
   * Clear notification history
   */
  clearNotificationHistory() {
    this.notificationHistory = [];
  }

  /**
   * Update configuration options
   * @param {Object} newOptions - New options to merge
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Reset handler state
   */
  reset() {
    this.removeDebugPanel();
    this.fieldErrorManager.clearAllFieldErrors();
    this.clearErrorHistory();
    this.clearNotificationHistory();
  }
}

/**
 * Create an enhanced error handler instance
 * @param {Object} options - Configuration options
 * @returns {EnhancedErrorHandler} Enhanced error handler instance
 */
export function createEnhancedErrorHandler(options = {}) {
  return new EnhancedErrorHandler(options);
}

/**
 * Utility functions for common error handling patterns
 */
export const errorHandlerUtils = {
  /**
   * Create a simple error handler for basic use cases
   * @param {Object} options - Handler options
   * @returns {Object} Simple error handler object
   */
  createSimple: (options = {}) => {
    const handler = createEnhancedErrorHandler({
      showDebugPanel: false,
      ...options,
    });

    return {
      handleSuccess: (response, opts) => handler.handleSuccess(response, opts),
      handleError: (error, opts) => handler.handleError(error, opts),
      getFieldErrors: () => handler.getFieldErrorManager().getAllFieldErrors(),
      clearErrors: () => handler.getFieldErrorManager().clearAllFieldErrors(),
      reset: () => handler.reset(),
    };
  },

  /**
   * Create a form-focused error handler
   * @param {Object} options - Handler options
   * @returns {Object} Form error handler object
   */
  createFormHandler: (options = {}) => {
    const handler = createEnhancedErrorHandler({
      showDebugPanel: false,
      handleFieldErrors: true,
      ...options,
    });

    return {
      handleSuccess: (response, opts) => handler.handleSuccess(response, opts),
      handleError: (error, opts) => handler.handleError(error, opts),
      fieldErrorManager: handler.getFieldErrorManager(),
      getFieldErrors: () => handler.getFieldErrorManager().getAllFieldErrors(),
      clearFieldErrors: () =>
        handler.getFieldErrorManager().clearAllFieldErrors(),
      validateField: (fieldName, value, validator) =>
        handler
          .getFieldErrorManager()
          .validateField(fieldName, value, validator),
      reset: () => handler.reset(),
    };
  },

  /**
   * Create a debug-focused error handler
   * @param {Object} options - Handler options
   * @returns {Object} Debug error handler object
   */
  createDebugHandler: (options = {}) => {
    const handler = createEnhancedErrorHandler({
      showDebugPanel: true,
      showNotifications: false,
      ...options,
    });

    return {
      handleSuccess: (response, opts) => handler.handleSuccess(response, opts),
      handleError: (error, opts) => handler.handleError(error, opts),
      showDebugPanel: (debugInfo) => handler.showDebugPanel(debugInfo),
      removeDebugPanel: () => handler.removeDebugPanel(),
      getErrorHistory: () => handler.getErrorHistory(),
      clearHistory: () => handler.clearErrorHistory(),
      reset: () => handler.reset(),
    };
  },
};

/**
 * Default export for easy importing
 */
export default createEnhancedErrorHandler;

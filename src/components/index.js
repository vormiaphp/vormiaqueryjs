/**
 * Components index file for VormiaQueryJS
 * Exports all UI components and utilities
 */

// Error Debug Panel
export {
  createErrorDebugPanel,
  removeErrorDebugPanel,
  updateErrorDebugPanel,
} from "./ErrorDebugPanel.js";

// Notification Panel
export {
  createNotificationPanel,
  showNotification,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  removeNotificationPanel,
  removeAllNotifications,
  updateNotificationPanel,
} from "./NotificationPanel.js";

// Field Errors
export {
  FieldErrorManager,
  createFieldErrorManager,
  processApiFieldErrors,
  createFieldErrorDisplay,
  getFieldClasses,
  fieldErrorUtils,
} from "../utils/fieldErrors.js";

// Enhanced Error Handler
export {
  EnhancedErrorHandler,
  createEnhancedErrorHandler,
  errorHandlerUtils,
} from "../utils/enhancedErrorHandler.js";

// Default export for easy importing
export const VormiaComponents = {
  // Error Debug Panel
  createErrorDebugPanel,
  removeErrorDebugPanel,
  updateErrorDebugPanel,

  // Notification Panel
  createNotificationPanel,
  showNotification,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  removeNotificationPanel,
  removeAllNotifications,
  updateNotificationPanel,

  // Field Errors
  FieldErrorManager,
  createFieldErrorManager,
  processApiFieldErrors,
  createFieldErrorDisplay,
  getFieldClasses,
  fieldErrorUtils,

  // Enhanced Error Handler
  EnhancedErrorHandler,
  createEnhancedErrorHandler,
  errorHandlerUtils,
};

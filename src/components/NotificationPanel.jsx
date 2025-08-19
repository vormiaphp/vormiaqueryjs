import React from "react";

/**
 * Notification Message Interface
 * @typedef {Object} NotificationMessage
 * @property {'success' | 'error' | 'warning' | 'info'} type - Notification type
 * @property {string} title - Notification title
 * @property {string} message - Notification message
 * @property {string} key - Unique key for the notification
 * @property {number} [duration] - Auto-dismiss duration in milliseconds
 * @property {'toast' | 'banner' | 'inapp' | 'modal'} [variant] - Notification display variant
 */

/**
 * Notification Panel Component
 * Displays notifications with different types and auto-dismiss functionality
 */
export function NotificationPanel({ notification, onClose, className = "" }) {
  if (!notification) return null;

  const { type, title, message, duration = 5000, variant = "inapp" } = notification;

  // Auto-dismiss after duration (only for toast and banner)
  React.useEffect(() => {
    if (duration > 0 && (variant === "toast" || variant === "banner")) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, variant]);

  // Get notification styles based on type and variant
  const getNotificationStyles = () => {
    const baseStyles = "rounded-lg border shadow-lg";
    
    // Variant-specific styles
    let variantStyles = "";
    switch (variant) {
      case "banner":
        variantStyles = "w-full p-3 border-l-4";
        break;
      case "modal":
        variantStyles = "max-w-md w-full p-6 mx-auto";
        break;
      case "toast":
        variantStyles = "max-w-sm w-full p-4";
        break;
      case "inapp":
      default:
        variantStyles = "max-w-md w-full p-4";
        break;
    }

    // Type-specific colors
    let typeStyles = "";
    switch (type) {
      case "success":
        typeStyles = "bg-green-50 border-green-200 text-green-800";
        break;
      case "error":
        typeStyles = "bg-red-50 border-red-200 text-red-800";
        break;
      case "warning":
        typeStyles = "bg-yellow-50 border-yellow-200 text-yellow-800";
        break;
      case "info":
        typeStyles = "bg-blue-50 border-blue-200 text-blue-800";
        break;
      default:
        typeStyles = "bg-gray-50 border-gray-200 text-gray-800";
        break;
    }

    return `${baseStyles} ${variantStyles} ${typeStyles}`;
  };

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  // Banner variant - spans full width at top
  if (variant === "banner") {
    return (
      <div className={`${getNotificationStyles()} ${className} sticky top-0 z-50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{getIcon()}</span>
            <div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-sm">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Modal variant - centered overlay
  if (variant === "modal") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`${getNotificationStyles()} ${className} relative`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-lg">{getIcon()}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-sm mt-1">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default inapp variant (original behavior)
  return (
    <div className={`${getNotificationStyles()} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Create notification panel HTML string (framework agnostic)
 * @param {NotificationMessage} notification - Notification data
 * @param {string} onCloseFunction - Function name to call on close
 * @returns {string} HTML string
 */
export function createNotificationHtml(
  notification,
  onCloseFunction = "closeNotification"
) {
  if (!notification) return "";

  const { type, title, message } = notification;

  const getStyles = () => {
    switch (type) {
      case "success":
        return "background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;";
      case "error":
        return "background-color: #fef2f2; border: 1px solid #fecaca; color: #dc2626;";
      case "warning":
        return "background-color: #fffbeb; border: 1px solid #fed7aa; color: #d97706;";
      case "info":
        return "background-color: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb;";
      default:
        return "background-color: #f9fafb; border: 1px solid #d1d5db; color: #374151;";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  return `
    <div class="notification-panel" style="padding: 1rem; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 28rem; width: 100%; ${getStyles()}">
      <div style="display: flex; align-items: flex-start; justify-content: space-between;">
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-size: 1.125rem;">${getIcon()}</span>
          <div style="flex: 1;">
            <h3 style="font-weight: 600; font-size: 0.875rem; margin: 0;">${title}</h3>
            <p style="font-size: 0.875rem; margin: 0.25rem 0 0 0;">${message}</p>
          </div>
        </div>
        <button onclick="${onCloseFunction}()" style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1rem; padding: 0;" aria-label="Close notification">
          ✕
        </button>
      </div>
    </div>
  `;
}

/**
 * Show notification using toast (if available)
 * @param {NotificationMessage} notification - Notification data
 * @param {Object} options - Toast options
 */
export function showNotificationToast(notification, options = {}) {
  const { title, message, type } = notification;

  // Try to use existing toast system
  if (typeof window !== "undefined" && window.toast) {
    window.toast({
      title,
      description: message,
      variant: type === "error" ? "destructive" : "default",
      ...options,
    });
    return;
  }

  // Fallback to console
  console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
}

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {string} title - Success title
 * @param {Object} options - Additional options
 */
export function showSuccessNotification(
  message,
  title = "Success",
  options = {}
) {
  const notification = {
    type: "success",
    title,
    message,
    key: `success-${Date.now()}`,
    ...options,
  };

  showNotificationToast(notification, options);
  return notification;
}

/**
 * Show success banner notification (top of page)
 * @param {string} message - Success message
 * @param {string} title - Success title
 * @param {Object} options - Additional options
 */
export function showSuccessBanner(
  message,
  title = "Success",
  options = {}
) {
  const notification = {
    type: "success",
    title,
    message,
    variant: "banner",
    key: `success-banner-${Date.now()}`,
    duration: 0, // No auto-dismiss for banners
    ...options,
  };

  return notification;
}

/**
 * Show success in-app notification (inline)
 * @param {string} message - Success message
 * @param {string} title - Success title
 * @param {Object} options - Additional options
 */
export function showSuccessInApp(
  message,
  title = "Success",
  options = {}
) {
  const notification = {
    type: "success",
    title,
    message,
    variant: "inapp",
    key: `success-inapp-${Date.now()}`,
    duration: 0, // No auto-dismiss for in-app
    ...options,
  };

  return notification;
}

/**
 * Show success modal notification (overlay)
 * @param {string} message - Success message
 * @param {string} title - Success title
 * @param {Object} options - Additional options
 */
export function showSuccessModal(
  message,
  title = "Success",
  options = {}
) {
  const notification = {
    type: "success",
    title,
    message,
    variant: "modal",
    key: `success-modal-${Date.now()}`,
    duration: 0, // No auto-dismiss for modals
    ...options,
  };

  return notification;
}

/**
 * Show error notification
 * @param {string} message - Error message
 * @param {string} title - Error title
 * @param {Object} options - Additional options
 */
export function showErrorNotification(message, title = "Error", options = {}) {
  const notification = {
    type: "error",
    title,
    message,
    key: `error-${Date.now()}`,
    ...options,
  };

  showNotificationToast(notification, options);
  return notification;
}

/**
 * Show error banner notification (top of page)
 * @param {string} message - Error message
 * @param {string} title - Error title
 * @param {Object} options - Additional options
 */
export function showErrorBanner(
  message,
  title = "Error",
  options = {}
) {
  const notification = {
    type: "error",
    title,
    message,
    variant: "banner",
    key: `error-banner-${Date.now()}`,
    duration: 0, // No auto-dismiss for banners
    ...options,
  };

  return notification;
}

/**
 * Show error in-app notification (inline)
 * @param {string} message - Error message
 * @param {string} title - Error title
 * @param {Object} options - Additional options
 */
export function showErrorInApp(
  message,
  title = "Error",
  options = {}
) {
  const notification = {
    type: "error",
    title,
    message,
    variant: "inapp",
    key: `error-inapp-${Date.now()}`,
    duration: 0, // No auto-dismiss for in-app
    ...options,
  };

  return notification;
}

/**
 * Show error modal notification (overlay)
 * @param {string} message - Error message
 * @param {string} title - Error title
 * @param {Object} options - Additional options
 */
export function showErrorModal(
  message,
  title = "Error",
  options = {}
) {
  const notification = {
    type: "error",
    title,
    message,
    variant: "modal",
    key: `error-modal-${Date.now()}`,
    duration: 0, // No auto-dismiss for modals
    ...options,
  };

  return notification;
}

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {string} title - Warning title
 * @param {Object} options - Additional options
 */
export function showWarningNotification(
  message,
  title = "Warning",
  options = {}
) {
  const notification = {
    type: "warning",
    title,
    message,
    key: `warning-${Date.now()}`,
    ...options,
  };

  showNotificationToast(notification, options);
  return notification;
}

/**
 * Show warning banner notification (top of page)
 * @param {string} message - Warning message
 * @param {string} title - Warning title
 * @param {Object} options - Additional options
 */
export function showWarningBanner(
  message,
  title = "Warning",
  options = {}
) {
  const notification = {
    type: "warning",
    title,
    message,
    variant: "banner",
    key: `warning-banner-${Date.now()}`,
    duration: 0, // No auto-dismiss for banners
    ...options,
  };

  return notification;
}

/**
 * Show warning in-app notification (inline)
 * @param {string} message - Warning message
 * @param {string} title - Warning title
 * @param {Object} options - Additional options
 */
export function showWarningInApp(
  message,
  title = "Warning",
  options = {}
) {
  const notification = {
    type: "warning",
    title,
    message,
    variant: "inapp",
    key: `warning-inapp-${Date.now()}`,
    duration: 0, // No auto-dismiss for in-app
    ...options,
  };

  return notification;
}

/**
 * Show warning modal notification (overlay)
 * @param {string} message - Warning message
 * @param {string} title - Warning title
 * @param {Object} options - Additional options
 */
export function showWarningModal(
  message,
  title = "Warning",
  options = {}
) {
  const notification = {
    type: "warning",
    title,
    message,
    variant: "modal",
    key: `warning-modal-${Date.now()}`,
    duration: 0, // No auto-dismiss for modals
    ...options,
  };

  return notification;
}

/**
 * Show info notification
 * @param {string} message - Info message
 * @param {string} title - Info title
 * @param {Object} options - Additional options
 */
export function showInfoNotification(message, title = "Info", options = {}) {
  const notification = {
    type: "info",
    title,
    message,
    key: `info-${Date.now()}`,
    ...options,
  };

  showNotificationToast(notification, options);
  return notification;
}

/**
 * Show info banner notification (top of page)
 * @param {string} message - Info message
 * @param {string} title - Info title
 * @param {Object} options - Additional options
 */
export function showInfoBanner(
  message,
  title = "Info",
  options = {}
) {
  const notification = {
    type: "info",
    title,
    message,
    variant: "banner",
    key: `info-banner-${Date.now()}`,
    duration: 0, // No auto-dismiss for banners
    ...options,
  };

  return notification;
}

/**
 * Show info in-app notification (inline)
 * @param {string} message - Info message
 * @param {string} title - Info title
 * @param {Object} options - Additional options
 */
export function showInfoInApp(
  message,
  title = "Info",
  options = {}
) {
  const notification = {
    type: "info",
    title,
    message,
    variant: "inapp",
    key: `info-inapp-${Date.now()}`,
    duration: 0, // No auto-dismiss for in-app
    ...options,
  };

  return notification;
}

/**
 * Show info modal notification (overlay)
 * @param {string} message - Info message
 * @param {string} title - Info title
 * @param {Object} options - Additional options
 */
export function showInfoModal(
  message,
  title = "Info",
  options = {}
) {
  const notification = {
    type: "info",
    title,
    message,
    variant: "modal",
    key: `info-modal-${Date.now()}`,
    duration: 0, // No auto-dismiss for modals
    ...options,
  };

  return notification;
}

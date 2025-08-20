import React from "react";
import "./NotificationPanel.css";

/**
 * Simple Notification Display Component
 * Easy drop-in replacement for manual HTML - handles all notification types
 */
export function SimpleNotification({ 
  type = "info", 
  message, 
  title, 
  onClose, 
  className = ""
}) {
  if (!message) return null;

  // Primary styling using Tailwind classes with CSS fallback
  const getStyles = () => {
    const baseStyles = "p-4 border rounded-lg vormia-notify-base";
    
    const typeStyles = {
      success: "bg-green-500 border-green-200 text-white vormia-notify-success",
      error: "bg-red-500 border-red-200 text-white vormia-notify-error",
      warning: "bg-yellow-500 border-yellow-200 text-white vormia-notify-warning",
      info: "bg-blue-500 border-blue-200 text-white vormia-notify-info",
      announce: "bg-black border-gray-200 text-white vormia-notify-announce"
    };
    
    return `${baseStyles} ${typeStyles[type] || typeStyles.announce}`;
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
          </svg>
        );
      case "error":
        return (
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case "warning":
        return (
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "info":
        return (
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case "announce":
        return (
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return "📢";
    }
  };

  const getIconColor = () => {
    const iconColors = {
      success: "text-white vormia-icon-success",
      error: "text-white vormia-icon-error",
      warning: "text-white vormia-icon-warning",
      info: "text-white vormia-icon-info",
      announce: "text-white vormia-icon-announce"
    };
    
    return iconColors[type] || iconColors.announce;
  };

  return (
    <div className={`${getStyles()} ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 hidden">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className="font-semibold text-sm">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${getIconColor()} hover:opacity-70 transition-opacity`}
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

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
    const baseStyles = "rounded-lg border shadow-lg vormia-notify-base";
    
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

    // Type-specific colors with CSS fallback
    let typeStyles = "";
    switch (type) {
      case "success":
        typeStyles = "bg-green-500 border-green-200 text-white vormia-notify-success";
        break;
      case "error":
        typeStyles = "bg-red-500 border-red-200 text-white vormia-notify-error";
        break;
      case "warning":
        typeStyles = "bg-yellow-500 border-yellow-200 text-white vormia-notify-warning";
        break;
      case "info":
        typeStyles = "bg-blue-500 border-blue-200 text-white vormia-notify-info";
        break;
      default:
        typeStyles = "bg-black border-gray-200 text-white vormia-notify-announce";
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
      <div className={`${getNotificationStyles()} ${className} sticky top-0 z-500`}>
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
      <div className="fixed inset-0 bg-black bg-opacity-500 flex items-center justify-center z-500">
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
  // console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
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

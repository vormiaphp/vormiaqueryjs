/**
 * Framework-agnostic NotificationPanel component
 * Provides user-friendly notifications for end users
 * Can be used with React, Vue, Svelte, or vanilla JS
 */

/**
 * Creates a notification element
 * @param {Object} options - Configuration options
 * @param {Object} options.notification - Notification message object
 * @param {Function} options.onClose - Callback when notification is closed
 * @param {string} options.targetSelector - CSS selector for where to render the notification
 * @param {number} options.autoHideDelay - Auto-hide delay in milliseconds (0 = no auto-hide)
 * @returns {HTMLElement|null} The notification element or null if no notification
 */
export function createNotificationPanel({
  notification,
  onClose = null,
  targetSelector = null,
  autoHideDelay = 0,
}) {
  if (!notification) return null;

  const getStyles = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "vormia-notification-success",
          border: "vormia-notification-success-border",
          text: "vormia-notification-success-text",
        };
      case "error":
        return {
          bg: "vormia-notification-error",
          border: "vormia-notification-error-border",
          text: "vormia-notification-error-text",
        };
      case "warning":
        return {
          bg: "vormia-notification-warning",
          border: "vormia-notification-warning-border",
          text: "vormia-notification-warning-text",
        };
      case "info":
        return {
          bg: "vormia-notification-info",
          border: "vormia-notification-info-border",
          text: "vormia-notification-info-text",
        };
      default:
        return {
          bg: "vormia-notification-default",
          border: "vormia-notification-default-border",
          text: "vormia-notification-default-text",
        };
    }
  };

  const getIcon = (type) => {
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

  const styles = getStyles(notification.type);
  const icon = getIcon(notification.type);

  // Create the notification element
  const notificationElement = document.createElement("div");
  notificationElement.className = `vormia-notification ${styles.bg} ${styles.border} ${styles.text}`;
  notificationElement.setAttribute("role", "alert");
  notificationElement.setAttribute(
    "data-notification-key",
    notification.key || "default"
  );

  notificationElement.innerHTML = `
    <div class="vormia-notification-content">
      ${
        notification.title
          ? `
        <div class="vormia-notification-title">
          ${icon} ${notification.title}
        </div>
      `
          : ""
      }
      <div class="vormia-notification-message ${
        notification.title ? "" : "vormia-notification-message-only"
      }">
        ${
          !notification.title
            ? `<span class="vormia-notification-icon">${icon}</span>`
            : ""
        }
        ${notification.message}
      </div>
    </div>
    ${
      onClose
        ? `
      <button class="vormia-notification-close" aria-label="Close notification">
        ×
      </button>
    `
        : ""
    }
  `;

  // Add event listeners
  if (onClose) {
    const closeButton = notificationElement.querySelector(
      ".vormia-notification-close"
    );
    if (closeButton) {
      closeButton.addEventListener("click", onClose);
    }
  }

  // Auto-hide functionality
  if (autoHideDelay > 0) {
    setTimeout(() => {
      if (notificationElement.parentNode) {
        removeNotificationPanel(notificationElement);
      }
    }, autoHideDelay);
  }

  // Add default styles if not already present
  addNotificationStyles();

  // Render to target if specified
  if (targetSelector) {
    const target = document.querySelector(targetSelector);
    if (target) {
      target.appendChild(notificationElement);
    }
  }

  return notificationElement;
}

/**
 * Creates and shows a notification with auto-hide
 * @param {Object} notification - Notification message object
 * @param {string} targetSelector - CSS selector for where to render
 * @param {number} autoHideDelay - Auto-hide delay in milliseconds
 * @returns {HTMLElement} The notification element
 */
export function showNotification(
  notification,
  targetSelector = "body",
  autoHideDelay = 5000
) {
  return createNotificationPanel({
    notification,
    onClose: null,
    targetSelector,
    autoHideDelay,
  });
}

/**
 * Creates a success notification
 * @param {string} message - Success message
 * @param {string} title - Optional title
 * @param {string} targetSelector - CSS selector for where to render
 * @param {number} autoHideDelay - Auto-hide delay in milliseconds
 * @returns {HTMLElement} The notification element
 */
export function showSuccessNotification(
  message,
  title = "Success!",
  targetSelector = "body",
  autoHideDelay = 3000
) {
  return showNotification(
    {
      type: "success",
      title,
      message,
      key: `success-${Date.now()}`,
    },
    targetSelector,
    autoHideDelay
  );
}

/**
 * Creates an error notification
 * @param {string} message - Error message
 * @param {string} title - Optional title
 * @param {string} targetSelector - CSS selector for where to render
 * @param {number} autoHideDelay - Auto-hide delay in milliseconds
 * @returns {HTMLElement} The notification element
 */
export function showErrorNotification(
  message,
  title = "Error",
  targetSelector = "body",
  autoHideDelay = 0
) {
  return showNotification(
    {
      type: "error",
      title,
      message,
      key: `error-${Date.now()}`,
    },
    targetSelector,
    autoHideDelay
  );
}

/**
 * Creates a warning notification
 * @param {string} message - Warning message
 * @param {string} title - Optional title
 * @param {string} targetSelector - CSS selector for where to render
 * @param {number} autoHideDelay - Auto-hide delay in milliseconds
 * @returns {HTMLElement} The notification element
 */
export function showWarningNotification(
  message,
  title = "Warning",
  targetSelector = "body",
  autoHideDelay = 4000
) {
  return showNotification(
    {
      type: "warning",
      title,
      message,
      key: `warning-${Date.now()}`,
    },
    targetSelector,
    autoHideDelay
  );
}

/**
 * Creates an info notification
 * @param {string} message - Info message
 * @param {string} title - Optional title
 * @param {string} targetSelector - CSS selector for where to render
 * @param {number} autoHideDelay - Auto-hide delay in milliseconds
 * @returns {HTMLElement} The notification element
 */
export function showInfoNotification(
  message,
  title = "Information",
  targetSelector = "body",
  autoHideDelay = 4000
) {
  return showNotification(
    {
      type: "info",
      title,
      message,
      key: `info-${Date.now()}`,
    },
    targetSelector,
    autoHideDelay
  );
}

/**
 * Adds default styles for notifications
 */
function addNotificationStyles() {
  if (document.getElementById("vormia-notification-styles")) return;

  const style = document.createElement("style");
  style.id = "vormia-notification-styles";
  style.textContent = `
    .vormia-notification {
      position: relative;
      display: flex;
      align-items: flex-start;
      width: 100%;
      border: 1px solid;
      border-radius: 0.375rem;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: vormia-notification-slide-in 0.3s ease-out;
    }
    
    .vormia-notification-content {
      flex: 1;
      font-size: 0.875rem;
      line-height: 1.25;
      margin: 0.375rem;
    }
    
    .vormia-notification-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .vormia-notification-message {
      display: flex;
      align-items: center;
    }
    
    .vormia-notification-message-only {
      display: flex;
      align-items: center;
    }
    
    .vormia-notification-icon {
      margin-right: 0.5rem;
    }
    
    .vormia-notification-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      margin-left: 0.5rem;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
    }
    
    .vormia-notification-close:hover {
      color: #6b7280;
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    /* Success styles */
    .vormia-notification-success {
      background-color: #f0fdf4;
      border-color: #bbf7d0;
      color: #166534;
    }
    
    .vormia-notification-success-border {
      border-color: #bbf7d0;
    }
    
    .vormia-notification-success-text {
      color: #166534;
    }
    
    /* Error styles */
    .vormia-notification-error {
      background-color: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }
    
    .vormia-notification-error-border {
      border-color: #fecaca;
    }
    
    .vormia-notification-error-text {
      color: #dc2626;
    }
    
    /* Warning styles */
    .vormia-notification-warning {
      background-color: #fffbeb;
      border-color: #fed7aa;
      color: #d97706;
    }
    
    .vormia-notification-warning-border {
      border-color: #fed7aa;
    }
    
    .vormia-notification-warning-text {
      color: #d97706;
    }
    
    /* Info styles */
    .vormia-notification-info {
      background-color: #eff6ff;
      border-color: #bfdbfe;
      color: #1d4ed8;
    }
    
    .vormia-notification-info-border {
      border-color: #bfdbfe;
    }
    
    .vormia-notification-info-text {
      color: #1d4ed8;
    }
    
    /* Default styles */
    .vormia-notification-default {
      background-color: #f9fafb;
      border-color: #e5e7eb;
      color: #374151;
    }
    
    .vormia-notification-default-border {
      border-color: #e5e7eb;
    }
    
    .vormia-notification-default-text {
      color: #374151;
    }
    
    /* Animation */
    @keyframes vormia-notification-slide-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Responsive */
    @media (max-width: 640px) {
      .vormia-notification {
        padding: 0.75rem;
      }
      
      .vormia-notification-content {
        font-size: 0.8rem;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * Removes a notification from the DOM
 * @param {HTMLElement} notificationElement - The notification element to remove
 */
export function removeNotificationPanel(notificationElement) {
  if (notificationElement && notificationElement.parentNode) {
    // Add fade-out animation
    notificationElement.style.animation =
      "vormia-notification-slide-out 0.3s ease-in";

    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.parentNode.removeChild(notificationElement);
      }
    }, 300);
  }
}

/**
 * Removes all notifications from a target
 * @param {string} targetSelector - CSS selector for the target container
 */
export function removeAllNotifications(targetSelector = "body") {
  const target = document.querySelector(targetSelector);
  if (target) {
    const notifications = target.querySelectorAll(".vormia-notification");
    notifications.forEach((notification) => {
      removeNotificationPanel(notification);
    });
  }
}

/**
 * Updates a notification with new content
 * @param {HTMLElement} notificationElement - The existing notification element
 * @param {Object} notification - New notification data
 */
export function updateNotificationPanel(notificationElement, notification) {
  if (!notificationElement || !notification) return;

  // Remove existing notification and create new one
  removeNotificationPanel(notificationElement);

  // Create new notification with updated content
  const newNotification = createNotificationPanel({
    notification,
    onClose: null,
    targetSelector: null,
  });

  // Replace the old notification
  if (newNotification && notificationElement.parentNode) {
    notificationElement.parentNode.insertBefore(
      newNotification,
      notificationElement.nextSibling
    );
    removeNotificationPanel(notificationElement);
  }
}

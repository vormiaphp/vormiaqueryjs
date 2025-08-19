/**
 * Framework-agnostic ErrorDebugPanel component
 * Provides technical debug information for developers
 * Can be used with React, Vue, Svelte, or vanilla JS
 */

/**
 * Creates an ErrorDebugPanel element
 * @param {Object} options - Configuration options
 * @param {Object} options.debugInfo - Debug information object
 * @param {boolean} options.showDebug - Whether to show the debug panel
 * @param {Function} options.onClose - Callback when debug panel is closed
 * @param {string} options.targetSelector - CSS selector for where to render the panel
 * @returns {HTMLElement|null} The debug panel element or null if not shown
 */
export function createErrorDebugPanel({
  debugInfo,
  showDebug = false,
  onClose = null,
  targetSelector = null,
}) {
  if (!showDebug || !debugInfo) return null;

  const { status, message, response, errorType, timestamp } = debugInfo;

  // Determine if this is a success or error response
  const isSuccess = response?.response?.data?.success === true;
  const isError = response?.response?.data?.success === false;

  // Create the debug panel element
  const debugPanel = document.createElement("div");
  debugPanel.className = "vormia-debug-panel";
  debugPanel.innerHTML = `
    <div class="vormia-debug-header">
      <h3 class="vormia-debug-title">
        ${
          isSuccess
            ? "✅ Success Debug"
            : isError
            ? "🚨 Error Debug"
            : "🐛 Debug Info"
        }
      </h3>
      ${
        onClose
          ? '<button class="vormia-debug-close" aria-label="Close debug panel">×</button>'
          : ""
      }
    </div>
    
    <div class="vormia-debug-content">
      <div class="vormia-debug-grid">
        <div class="vormia-debug-item">
          <span class="vormia-debug-label">HTTP Status:</span>
          <span class="vormia-debug-value vormia-status-${
            status >= 500 ? "error" : status >= 400 ? "warning" : "info"
          }">
            ${status}
          </span>
        </div>
        <div class="vormia-debug-item">
          <span class="vormia-debug-label">Error Type:</span>
          <span class="vormia-debug-value vormia-type-info">${errorType}</span>
        </div>
      </div>
      
      <div class="vormia-debug-item">
        <span class="vormia-debug-label">API Message:</span>
        <p class="vormia-debug-message">
          ${
            response?.response?.data?.message ||
            message ||
            "No message available"
          }
        </p>
      </div>
      
      ${
        response?.response?.data
          ? `
        <div class="vormia-debug-item">
          <span class="vormia-debug-label">
            ${
              isSuccess
                ? "📊 Response Data:"
                : isError
                ? "🚨 Response Errors:"
                : "📋 Response Info:"
            }
          </span>
          <pre class="vormia-debug-data vormia-data-${
            isSuccess ? "success" : isError ? "error" : "info"
          }">
            ${JSON.stringify(
              isSuccess
                ? response.response.data.data
                : response.response.data.errors,
              null,
              2
            )}
          </pre>
        </div>
      `
          : ""
      }
      
      ${
        response?.debug || response?.response?.data?.debug
          ? `
        <div class="vormia-debug-item">
          <span class="vormia-debug-label">🔍 Debug Info:</span>
          <pre class="vormia-debug-debug">
            ${JSON.stringify(
              response.debug || response.response.data.debug,
              null,
              2
            )}
          </pre>
        </div>
      `
          : ""
      }
      
      <div class="vormia-debug-timestamp">${timestamp}</div>
    </div>
  `;

  // Add event listeners
  if (onClose) {
    const closeButton = debugPanel.querySelector(".vormia-debug-close");
    if (closeButton) {
      closeButton.addEventListener("click", onClose);
    }
  }

  // Add default styles if not already present
  addDebugPanelStyles();

  // Render to target if specified
  if (targetSelector) {
    const target = document.querySelector(targetSelector);
    if (target) {
      target.appendChild(debugPanel);
    }
  }

  return debugPanel;
}

/**
 * Adds default styles for the debug panel
 */
function addDebugPanelStyles() {
  if (document.getElementById("vormia-debug-styles")) return;

  const style = document.createElement("style");
  style.id = "vormia-debug-styles";
  style.textContent = `
    .vormia-debug-panel {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .vormia-debug-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    
    .vormia-debug-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin: 0;
    }
    
    .vormia-debug-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
    }
    
    .vormia-debug-close:hover {
      color: #6b7280;
      background-color: #f3f4f6;
    }
    
    .vormia-debug-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      font-size: 0.75rem;
    }
    
    .vormia-debug-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    
    .vormia-debug-item {
      display: flex;
      flex-direction: column;
    }
    
    .vormia-debug-label {
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }
    
    .vormia-debug-value {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      display: inline-block;
      width: fit-content;
    }
    
    .vormia-status-error {
      background-color: #fef2f2;
      color: #dc2626;
    }
    
    .vormia-status-warning {
      background-color: #fffbeb;
      color: #d97706;
    }
    
    .vormia-status-info {
      background-color: #f3f4f6;
      color: #374151;
    }
    
    .vormia-type-info {
      background-color: #dbeafe;
      color: #1d4ed8;
    }
    
    .vormia-debug-message {
      margin: 0.25rem 0 0 0;
      color: #374151;
      word-break: break-words;
      background-color: #f3f4f6;
      padding: 0.5rem;
      border-radius: 0.25rem;
    }
    
    .vormia-debug-data {
      margin: 0.25rem 0 0 0;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      overflow-x: auto;
      max-height: 8rem;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .vormia-data-success {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
    }
    
    .vormia-data-error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
    }
    
    .vormia-data-info {
      background-color: #f3f4f6;
    }
    
    .vormia-debug-debug {
      margin: 0.25rem 0 0 0;
      padding: 0.5rem;
      background-color: #f3f4f6;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      overflow-x: auto;
      max-height: 8rem;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .vormia-debug-timestamp {
      color: #9ca3af;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
    
    @media (max-width: 640px) {
      .vormia-debug-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * Removes the debug panel from the DOM
 * @param {HTMLElement} debugPanel - The debug panel element to remove
 */
export function removeErrorDebugPanel(debugPanel) {
  if (debugPanel && debugPanel.parentNode) {
    debugPanel.parentNode.removeChild(debugPanel);
  }
}

/**
 * Updates the debug panel with new information
 * @param {HTMLElement} debugPanel - The existing debug panel element
 * @param {Object} debugInfo - New debug information
 */
export function updateErrorDebugPanel(debugPanel, debugInfo) {
  if (!debugPanel || !debugInfo) return;

  // Remove existing panel and create new one
  removeErrorDebugPanel(debugPanel);

  // Create new panel with updated info
  const newPanel = createErrorDebugPanel({
    debugInfo,
    showDebug: true,
    onClose: null, // You'll need to handle this based on your use case
    targetSelector: null,
  });

  // Replace the old panel
  if (newPanel && debugPanel.parentNode) {
    debugPanel.parentNode.insertBefore(newPanel, debugPanel.nextSibling);
    removeErrorDebugPanel(debugPanel);
  }
}

/**
 * Field Errors Utility for VormiaQueryJS
 * Provides field-level error handling for forms
 * Framework-agnostic and can be used with any frontend framework
 */

/**
 * Field error state manager
 * Handles field-level validation errors and provides utilities for form handling
 */
export class FieldErrorManager {
  constructor(initialFields = {}) {
    this.fieldErrors = { ...initialFields };
    this.listeners = [];
    this.errorHistory = [];
  }

  /**
   * Set errors for specific fields
   * @param {Object} errors - Object with field names as keys and error messages as values
   */
  setFieldErrors(errors) {
    this.fieldErrors = { ...errors };
    this.errorHistory.push({
      timestamp: new Date().toISOString(),
      errors: { ...errors },
    });
    this.notifyListeners();
  }

  /**
   * Set error for a single field
   * @param {string} fieldName - Name of the field
   * @param {string} errorMessage - Error message for the field
   */
  setFieldError(fieldName, errorMessage) {
    this.fieldErrors[fieldName] = errorMessage;
    this.notifyListeners();
  }

  /**
   * Clear error for a specific field
   * @param {string} fieldName - Name of the field to clear
   */
  clearFieldError(fieldName) {
    if (this.fieldErrors[fieldName]) {
      delete this.fieldErrors[fieldName];
      this.notifyListeners();
    }
  }

  /**
   * Clear all field errors
   */
  clearAllFieldErrors() {
    this.fieldErrors = {};
    this.notifyListeners();
  }

  /**
   * Get error for a specific field
   * @param {string} fieldName - Name of the field
   * @returns {string|undefined} Error message for the field
   */
  getFieldError(fieldName) {
    return this.fieldErrors[fieldName];
  }

  /**
   * Get all field errors
   * @returns {Object} All field errors
   */
  getAllFieldErrors() {
    return { ...this.fieldErrors };
  }

  /**
   * Check if a field has an error
   * @param {string} fieldName - Name of the field
   * @returns {boolean} True if field has an error
   */
  hasFieldError(fieldName) {
    return !!this.fieldErrors[fieldName];
  }

  /**
   * Check if any field has errors
   * @returns {boolean} True if any field has errors
   */
  hasAnyErrors() {
    return Object.keys(this.fieldErrors).length > 0;
  }

  /**
   * Get the count of fields with errors
   * @returns {number} Number of fields with errors
   */
  getErrorCount() {
    return Object.keys(this.fieldErrors).length;
  }

  /**
   * Get error history
   * @returns {Array} Array of error history entries
   */
  getErrorHistory() {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = [];
  }

  /**
   * Add a listener for field error changes
   * @param {Function} listener - Function to call when errors change
   * @returns {Function} Function to remove the listener
   */
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.fieldErrors);
      } catch (error) {
        console.error("Error in field error listener:", error);
      }
    });
  }

  /**
   * Process API error response and extract field errors
   * @param {Object} error - VormiaQueryJS error object
   * @param {Object} fieldMapping - Optional mapping of API field names to form field names
   */
  processApiErrors(error, fieldMapping = {}) {
    const apiResponse = error.response;
    const fieldErrors =
      apiResponse?.errors || apiResponse?.response?.data?.errors || {};

    // Map API field names to form field names if mapping provided
    const mappedErrors = {};
    Object.keys(fieldErrors).forEach((apiField) => {
      const formField = fieldMapping[apiField] || apiField;
      if (Array.isArray(fieldErrors[apiField])) {
        mappedErrors[formField] = fieldErrors[apiField].join("; ");
      } else {
        mappedErrors[formField] = fieldErrors[apiField];
      }
    });

    this.setFieldErrors(mappedErrors);
    return mappedErrors;
  }

  /**
   * Validate a field value and set error if invalid
   * @param {string} fieldName - Name of the field
   * @param {*} value - Value to validate
   * @param {Function} validator - Validation function that returns error message or null
   */
  validateField(fieldName, value, validator) {
    const error = validator(value);
    if (error) {
      this.setFieldError(fieldName, error);
    } else {
      this.clearFieldError(fieldName);
    }
    return !error;
  }

  /**
   * Get CSS classes for a field based on error state
   * @param {string} fieldName - Name of the field
   * @param {string} baseClasses - Base CSS classes
   * @param {string} errorClasses - CSS classes to add when field has error
   * @returns {string} CSS classes string
   */
  getFieldClasses(
    fieldName,
    baseClasses = "",
    errorClasses = "border-red-500"
  ) {
    return this.hasFieldError(fieldName)
      ? `${baseClasses} ${errorClasses}`.trim()
      : baseClasses;
  }

  /**
   * Get field error display element
   * @param {string} fieldName - Name of the field
   * @param {string} targetSelector - CSS selector for where to render the error
   * @returns {HTMLElement|null} Error display element or null if no error
   */
  createFieldErrorDisplay(fieldName, targetSelector = null) {
    const error = this.getFieldError(fieldName);
    if (!error) return null;

    const errorElement = document.createElement("p");
    errorElement.className = "vormia-field-error";
    errorElement.textContent = error;
    errorElement.setAttribute("data-field", fieldName);

    // Add default styles if not already present
    addFieldErrorStyles();

    // Render to target if specified
    if (targetSelector) {
      const target = document.querySelector(targetSelector);
      if (target) {
        target.appendChild(errorElement);
      }
    }

    return errorElement;
  }

  /**
   * Remove field error display element
   * @param {HTMLElement} errorElement - Error display element to remove
   */
  removeFieldErrorDisplay(errorElement) {
    if (errorElement && errorElement.parentNode) {
      errorElement.parentNode.removeChild(errorElement);
    }
  }

  /**
   * Reset field errors for specific fields
   * @param {Array} fieldNames - Array of field names to reset
   */
  resetFields(fieldNames) {
    fieldNames.forEach((fieldName) => {
      this.clearFieldError(fieldName);
    });
  }

  /**
   * Get summary of all errors
   * @returns {Object} Summary object with error count and field list
   */
  getErrorSummary() {
    return {
      count: this.getErrorCount(),
      fields: Object.keys(this.fieldErrors),
      hasErrors: this.hasAnyErrors(),
      errors: { ...this.fieldErrors },
    };
  }
}

/**
 * Create a field error manager instance
 * @param {Object} initialFields - Initial field errors
 * @returns {FieldErrorManager} Field error manager instance
 */
export function createFieldErrorManager(initialFields = {}) {
  return new FieldErrorManager(initialFields);
}

/**
 * Process VormiaQueryJS API errors and extract field errors
 * @param {Object} error - VormiaQueryJS error object
 * @param {Object} fieldMapping - Optional mapping of API field names to form field names
 * @returns {Object} Processed field errors
 */
export function processApiFieldErrors(error, fieldMapping = {}) {
  const apiResponse = error.response;
  const fieldErrors =
    apiResponse?.errors || apiResponse?.response?.data?.errors || {};

  // Map API field names to form field names if mapping provided
  const mappedErrors = {};
  Object.keys(fieldErrors).forEach((apiField) => {
    const formField = fieldMapping[apiField] || apiField;
    if (Array.isArray(fieldErrors[apiField])) {
      mappedErrors[formField] = fieldErrors[apiField].join("; ");
    } else {
      mappedErrors[formField] = fieldErrors[apiField];
    }
  });

  return mappedErrors;
}

/**
 * Create field error display element
 * @param {string} fieldName - Name of the field
 * @param {string} errorMessage - Error message
 * @param {string} targetSelector - CSS selector for where to render the error
 * @returns {HTMLElement} Error display element
 */
export function createFieldErrorDisplay(
  fieldName,
  errorMessage,
  targetSelector = null
) {
  if (!errorMessage) return null;

  const errorElement = document.createElement("p");
  errorElement.className = "vormia-field-error";
  errorElement.textContent = errorMessage;
  errorElement.setAttribute("data-field", fieldName);

  // Add default styles if not already present
  addFieldErrorStyles();

  // Render to target if specified
  if (targetSelector) {
    const target = document.querySelector(targetSelector);
    if (target) {
      target.appendChild(errorElement);
    }
  }

  return errorElement;
}

/**
 * Get CSS classes for a field based on error state
 * @param {boolean} hasError - Whether the field has an error
 * @param {string} baseClasses - Base CSS classes
 * @param {string} errorClasses - CSS classes to add when field has error
 * @returns {string} CSS classes string
 */
export function getFieldClasses(
  hasError,
  baseClasses = "",
  errorClasses = "border-red-500"
) {
  return hasError ? `${baseClasses} ${errorClasses}`.trim() : baseClasses;
}

/**
 * Add default styles for field errors
 */
function addFieldErrorStyles() {
  if (document.getElementById("vormia-field-error-styles")) return;

  const style = document.createElement("style");
  style.id = "vormia-field-error-styles";
  style.textContent = `
    .vormia-field-error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      margin-bottom: 0.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: vormia-field-error-fade-in 0.2s ease-out;
    }
    
    @keyframes vormia-field-error-fade-in {
      from {
        opacity: 0;
        transform: translateY(-5px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .vormia-field-error[data-field] {
      position: relative;
    }
    
    .vormia-field-error[data-field]::before {
      content: "⚠️";
      margin-right: 0.25rem;
      font-size: 0.75rem;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Utility functions for common field error patterns
 */
export const fieldErrorUtils = {
  /**
   * Clear field error when user starts typing
   * @param {FieldErrorManager} errorManager - Field error manager instance
   * @param {string} fieldName - Name of the field
   */
  clearOnInput: (errorManager, fieldName) => {
    if (errorManager.hasFieldError(fieldName)) {
      errorManager.clearFieldError(fieldName);
    }
  },

  /**
   * Clear all field errors when form is reset
   * @param {FieldErrorManager} errorManager - Field error manager instance
   */
  clearOnReset: (errorManager) => {
    errorManager.clearAllFieldErrors();
  },

  /**
   * Validate required fields
   * @param {Object} formData - Form data object
   * @param {Array} requiredFields - Array of required field names
   * @param {FieldErrorManager} errorManager - Field error manager instance
   * @returns {boolean} True if all required fields are valid
   */
  validateRequired: (formData, requiredFields, errorManager) => {
    let isValid = true;

    requiredFields.forEach((fieldName) => {
      const value = formData[fieldName];
      if (!value || (typeof value === "string" && value.trim() === "")) {
        errorManager.setFieldError(fieldName, "This field is required");
        isValid = false;
      } else {
        errorManager.clearFieldError(fieldName);
      }
    });

    return isValid;
  },

  /**
   * Validate email format
   * @param {string} email - Email value to validate
   * @returns {string|null} Error message or null if valid
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  },

  /**
   * Validate password strength
   * @param {string} password - Password value to validate
   * @returns {string|null} Error message or null if valid
   */
  validatePassword: (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  },

  /**
   * Validate password confirmation
   * @param {string} password - Password value
   * @param {string} confirmPassword - Password confirmation value
   * @returns {string|null} Error message or null if valid
   */
  validatePasswordConfirmation: (password, confirmPassword) => {
    return password === confirmPassword ? null : "Passwords do not match";
  },
};

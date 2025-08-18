---
// Astro component script
---

<div class="vormia-demo">
  <h1>VormiaQueryJS Debug & Notification System - Astro</h1>

  <!-- Notifications Container -->
  <div id="notifications"></div>

  <!-- Form Section -->
  <div class="form-section">
    <h2>User Registration Form</h2>
    <form id="registration-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          class="form-input"
          required
        />
        <div class="error-display" data-field="name"></div>
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          class="form-input"
          required
        />
        <div class="error-display" data-field="email"></div>
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          class="form-input"
          required
        />
        <div class="error-display" data-field="password"></div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          class="form-input"
          required
        />
        <div class="error-display" data-field="confirmPassword"></div>
      </div>

      <div id="general-error" class="general-error" style="display: none;">
        <p class="error-message"></p>
      </div>

      <div class="form-actions">
        <button type="submit" id="submit-btn">Register</button>
        <button type="button" id="clear-errors">Clear Errors</button>
      </div>
    </form>
  </div>

  <!-- Debug Section -->
  <div class="debug-section">
    <h2>Debug Panel</h2>
    <div id="debug-panel"></div>
  </div>

  <!-- Controls -->
  <div class="controls">
    <button id="test-success">Test Success</button>
    <button id="test-error">Test Error</button>
    <button id="test-validation">Test Validation Error</button>
    <button id="toggle-debug">Toggle Debug Panel</button>
  </div>
</div>

<script>
  import {
    createEnhancedErrorHandler,
    createFieldErrorManager,
    showSuccessNotification,
    showErrorNotification,
    createErrorDebugPanel,
  } from "vormiaqueryjs";

  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    init();
  });

  function init() {
    // Initialize error handler
    const errorHandler = createEnhancedErrorHandler({
      debugEnabled: true,
      showNotifications: true,
      showDebugPanel: true,
      notificationTarget: "#notifications",
      debugTarget: "#debug-panel",
    });

    // Initialize field error manager
    const fieldErrorManager = createFieldErrorManager();

    // Form data
    let formData = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // DOM elements
    const form = document.getElementById("registration-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const submitBtn = document.getElementById("submit-btn");
    const generalError = document.getElementById("general-error");

    // Set debug panel visibility
    const isDebugEnabled = import.meta.env.VITE_VORMIA_DEBUG === "true";

    // Show welcome notification
    showSuccessNotification(
      "Welcome to VormiaQueryJS Debug & Notification System!",
      "System Ready",
      "#notifications",
      3000
    );

    // Setup field error listener
    fieldErrorManager.addListener((fieldErrors) => {
      updateFieldErrorDisplays(fieldErrors);
    });

    // Setup event listeners
    form.addEventListener("submit", handleFormSubmit);
    nameInput.addEventListener("input", () => handleInputChange("name"));
    emailInput.addEventListener("input", () => handleInputChange("email"));
    passwordInput.addEventListener("input", () => handleInputChange("password"));
    confirmPasswordInput.addEventListener("input", () => handleInputChange("confirmPassword"));

    document.getElementById("clear-errors").addEventListener("click", clearAllErrors);
    document.getElementById("test-success").addEventListener("click", testSuccess);
    document.getElementById("test-error").addEventListener("click", testError);
    document.getElementById("test-validation").addEventListener("click", testValidationError);
    document.getElementById("toggle-debug").addEventListener("click", toggleDebugPanel);

    // Handle form submission
    async function handleFormSubmit(event) {
      event.preventDefault();

      // Clear previous errors
      fieldErrorManager.clearAllFieldErrors();
      hideGeneralError();

      // Get form data
      formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        confirmPassword: confirmPasswordInput.value,
      };

      // Validate form
      if (!validateForm()) {
        return;
      }

      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = "Registering...";

      try {
        // Simulate API call
        const response = await simulateApiCall(formData);

        // Handle success
        errorHandler.handleSuccess(response, {
          notificationMessage: "User registered successfully!",
          debugLabel: "User Registration Success",
        });

        // Set debug info for debug panel
        const debugInfo = {
          status: 200,
          message: "Operation successful",
          response: {
            response: {
              data: {
                success: true,
                message: response?.data?.message || "Operation completed successfully",
                data: response?.data,
                debug: response?.debug,
              },
            },
            debug: response?.debug,
          },
          errorType: "success",
          timestamp: new Date().toISOString(),
        };

        // Show debug panel if enabled
        if (isDebugEnabled) {
          createErrorDebugPanel({
            debugInfo,
            showDebug: true,
            onClose: null,
            targetSelector: "#debug-panel",
          });
        }

        // Reset form
        form.reset();
        formData = { name: "", email: "", password: "", confirmPassword: "" };
      } catch (error) {
        // Handle error
        const errorInfo = errorHandler.handleError(error, {
          handleFieldErrors: true,
          fieldMapping: {
            password_confirmation: "confirmPassword",
          },
        });

        // Show debug panel if enabled
        if (isDebugEnabled) {
          createErrorDebugPanel({
            debugInfo: errorInfo,
            showDebug: true,
            onClose: null,
            targetSelector: "#debug-panel",
          });
        }

        // Show general error if no field errors
        if (Object.keys(fieldErrors).length === 0) {
          showGeneralError(errorInfo.message);
        }
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = "Register";
      }
    }

    // Handle input changes
    function handleInputChange(fieldName) {
      // Clear field error when user starts typing
      if (fieldErrorManager.hasFieldError(fieldName)) {
        fieldErrorManager.clearFieldError(fieldName);
      }

      // Clear general error
      hideGeneralError();
    }

    // Validate form
    function validateForm() {
      let isValid = true;
      const newFieldErrors = {};

      // Required field validation
      if (!formData.name) {
        newFieldErrors.name = "Name is required";
        isValid = false;
      }

      if (!formData.email) {
        newFieldErrors.email = "Email is required";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newFieldErrors.email = "Please enter a valid email address";
        isValid = false;
      }

      if (!formData.password) {
        newFieldErrors.password = "Password is required";
        isValid = false;
      } else if (formData.password.length < 8) {
        newFieldErrors.password = "Password must be at least 8 characters long";
        isValid = false;
      }

      if (!formData.confirmPassword) {
        newFieldErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newFieldErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }

      // Set field errors
      fieldErrorManager.setFieldErrors(newFieldErrors);

      return isValid;
    }

    // Update field error displays
    function updateFieldErrorDisplays(fieldErrors) {
      // Clear all error displays
      document.querySelectorAll(".error-display").forEach((el) => {
        el.innerHTML = "";
      });

      // Show errors for fields that have them
      Object.keys(fieldErrors).forEach((fieldName) => {
        const errorElement = document.querySelector(`[data-field="${fieldName}"]`);
        if (errorElement) {
          errorElement.innerHTML = `<span class="error-message">${fieldErrors[fieldName]}</span>`;
        }
      });

      // Update input field classes
      updateFieldClasses();
    }

    // Update field classes based on error state
    function updateFieldClasses() {
      nameInput.className = `form-input ${fieldErrorManager.hasFieldError("name") ? "error" : ""}`;
      emailInput.className = `form-input ${fieldErrorManager.hasFieldError("email") ? "error" : ""}`;
      passwordInput.className = `form-input ${fieldErrorManager.hasFieldError("password") ? "error" : ""}`;
      confirmPasswordInput.className = `form-input ${fieldErrorManager.hasFieldError("confirmPassword") ? "error" : ""}`;
    }

    // Clear all errors
    function clearAllErrors() {
      fieldErrorManager.clearAllFieldErrors();
      hideGeneralError();
    }

    // Show general error
    function showGeneralError(message) {
      const errorElement = generalError.querySelector(".error-message");
      errorElement.textContent = message;
      generalError.style.display = "block";
    }

    // Hide general error
    function hideGeneralError() {
      generalError.style.display = "none";
    }

    // Test functions
    function testSuccess() {
      const mockResponse = {
        data: {
          success: true,
          message: "Test operation completed successfully",
          data: { id: 123, status: "active" },
          debug: { timestamp: new Date().toISOString() },
        },
      };

      errorHandler.handleSuccess(mockResponse, {
        notificationMessage: "Test success operation completed!",
        debugLabel: "Test Success",
      });

      if (isDebugEnabled) {
        createErrorDebugPanel({
          debugInfo: {
            status: 200,
            message: "Test operation successful",
            response: {
              response: {
                data: {
                  success: true,
                  message: "Test operation completed successfully",
                  data: { id: 123, status: "active" },
                  debug: { timestamp: new Date().toISOString() },
                },
              },
            },
            errorType: "success",
            timestamp: new Date().toISOString(),
          },
          showDebug: true,
          onClose: null,
          targetSelector: "#debug-panel",
        });
      }
    }

    function testError() {
      const mockError = {
        status: 500,
        message: "Internal server error",
        response: {
          message: "Something went wrong on the server",
          response: {
            data: {
              success: false,
              message: "Server is experiencing issues",
              debug: { errorCode: "INT_ERR_001" },
            },
          },
        },
        isServerError: () => true,
      };

      errorHandler.handleError(mockError, {
        debugLabel: "Test Server Error",
      });

      if (isDebugEnabled) {
        createErrorDebugPanel({
          debugInfo: {
            status: 500,
            message: "Internal server error",
            response: mockError.response,
            errorType: "server",
            timestamp: new Date().toISOString(),
          },
          showDebug: true,
          onClose: null,
          targetSelector: "#debug-panel",
        });
      }
    }

    function testValidationError() {
      const mockValidationError = {
        status: 422,
        message: "Validation failed",
        response: {
          message: "Please check the form fields below",
          errors: {
            name: ["Name must be at least 2 characters"],
            email: ["Email format is invalid"],
            password: ["Password is too weak"],
          },
        },
        isValidationError: () => true,
      };

      errorHandler.handleError(mockValidationError, {
        handleFieldErrors: true,
        fieldMapping: {},
        debugLabel: "Test Validation Error",
      });

      if (isDebugEnabled) {
        createErrorDebugPanel({
          debugInfo: {
            status: 422,
            message: "Validation failed",
            response: mockValidationError.response,
            errorType: "validation",
            timestamp: new Date().toISOString(),
          },
          showDebug: true,
          onClose: null,
          targetSelector: "#debug-panel",
        });
      }
    }

    function toggleDebugPanel() {
      const debugPanel = document.getElementById("debug-panel");
      if (debugPanel.style.display === "none") {
        debugPanel.style.display = "block";
      } else {
        debugPanel.style.display = "none";
      }
    }

    // Simulate API call
    async function simulateApiCall(data) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random success/failure
          if (Math.random() > 0.3) {
            resolve({
              data: {
                success: true,
                message: "User registered successfully",
                data: { id: Math.floor(Math.random() * 1000), ...data },
                debug: { timestamp: new Date().toISOString() },
              },
            });
          } else {
            reject({
              status: 422,
              message: "Validation failed",
              response: {
                message: "Please check the form fields below",
                errors: {
                  name: ["Name must be at least 2 characters"],
                  email: ["Email format is invalid"],
                  password: ["Password is too weak"],
                },
              },
              isValidationError: () => true,
            });
          }
        }, 1000);
      });
    }
  }
</script>

<style>
  .vormia-demo {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .form-section {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }

  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-input.error {
    border-color: #dc2626;
  }

  .error-display {
    min-height: 20px;
    margin-top: 5px;
  }

  .error-message {
    color: #dc2626;
    font-size: 12px;
  }

  .general-error {
    margin: 15px 0;
    padding: 10px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
  }

  .form-actions {
    margin-top: 20px;
  }

  button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
    margin-bottom: 10px;
  }

  button:hover {
    background: #2563eb;
  }

  button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .debug-section {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }

  .controls {
    margin: 20px 0;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }
</style> 
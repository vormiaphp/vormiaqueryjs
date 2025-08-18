import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
  showSuccessNotification,
  showErrorNotification,
  createErrorDebugPanel,
} from "vormiaqueryjs";

export default component$(() => {
  // State management
  const formData = useSignal({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const fieldErrors = useSignal({});
  const generalError = useSignal("");
  const debugInfo = useSignal(null);
  const showDebug = useSignal(false);
  const isSubmitting = useSignal(false);
  const errorHandler = useSignal(null);
  const fieldErrorManager = useSignal(null);

  // Initialize components
  useVisibleTask$(() => {
    initializeComponents();
    setupFieldErrorListener();
    showWelcomeNotification();
  });

  const initializeComponents = $(() => {
    // Initialize error handler
    errorHandler.value = createEnhancedErrorHandler({
      debugEnabled: true,
      showNotifications: true,
      showDebugPanel: true,
      notificationTarget: "#notifications",
      debugTarget: "#debug-panel",
    });

    // Initialize field error manager
    fieldErrorManager.value = createFieldErrorManager();

    // Set debug panel visibility
    showDebug.value = import.meta.env.VITE_VORMIA_DEBUG === "true";
  });

  const setupFieldErrorListener = $(() => {
    fieldErrorManager.value.addListener((errors) => {
      fieldErrors.value = errors;
    });
  });

  const showWelcomeNotification = $(() => {
    showSuccessNotification(
      "Welcome to VormiaQueryJS Debug & Notification System!",
      "System Ready",
      "#notifications",
      3000
    );
  });

  const handleSubmit = $(async (event) => {
    event.preventDefault();

    // Clear previous errors
    fieldErrorManager.value.clearAllFieldErrors();
    generalError.value = "";

    // Validate form
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      // Simulate API call
      const response = await simulateApiCall(formData.value);

      // Handle success
      errorHandler.value.handleSuccess(response, {
        notificationMessage: "User registered successfully!",
        debugLabel: "User Registration Success",
      });

      // Set debug info
      debugInfo.value = {
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

      showDebug.value = true;

      // Reset form
      formData.value = { name: "", email: "", password: "", confirmPassword: "" };
    } catch (error) {
      // Handle error
      const errorInfo = errorHandler.value.handleError(error, {
        handleFieldErrors: true,
        fieldMapping: {
          password_confirmation: "confirmPassword",
        },
      });

      // Set debug info
      debugInfo.value = errorInfo;
      showDebug.value = true;

      // Set general error if no field errors
      if (Object.keys(fieldErrors.value).length === 0) {
        generalError.value = errorInfo.message;
      }
    } finally {
      isSubmitting.value = false;
    }
  });

  const handleInputChange = $((fieldName, event) => {
    const value = event.target.value;
    formData.value = { ...formData.value, [fieldName]: value };

    // Clear field error when user starts typing
    if (fieldErrors.value[fieldName]) {
      fieldErrorManager.value.clearFieldError(fieldName);
    }

    // Clear general error
    if (generalError.value) {
      generalError.value = "";
    }
  });

  const validateForm = $(() => {
    let isValid = true;
    const newFieldErrors = {};

    // Required field validation
    if (!formData.value.name.trim()) {
      newFieldErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.value.email.trim()) {
      newFieldErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      newFieldErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.value.password) {
      newFieldErrors.password = "Password is required";
      isValid = false;
    } else if (formData.value.password.length < 8) {
      newFieldErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    if (!formData.value.confirmPassword) {
      newFieldErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.value.password !== formData.value.confirmPassword) {
      newFieldErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    // Set field errors
    fieldErrorManager.value.setFieldErrors(newFieldErrors);

    return isValid;
  });

  const clearAllErrors = $(() => {
    fieldErrorManager.value.clearAllFieldErrors();
    generalError.value = "";
  });

  const toggleDebug = $(() => {
    showDebug.value = !showDebug.value;
  });

  const getFieldErrorClass = $((fieldName) => {
    return fieldErrors.value[fieldName] ? "border-red-500" : "";
  });

  const testSuccess = $(() => {
    const mockResponse = {
      data: {
        success: true,
        message: "Test operation completed successfully",
        data: { id: 123, status: "active" },
        debug: { timestamp: new Date().toISOString() },
      },
    };

    errorHandler.value.handleSuccess(mockResponse, {
      notificationMessage: "Test success operation completed!",
      debugLabel: "Test Success",
    });

    debugInfo.value = {
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
    };
    showDebug.value = true;
  });

  const testError = $(() => {
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

    errorHandler.value.handleError(mockError, {
      debugLabel: "Test Server Error",
    });

    debugInfo.value = {
      status: 500,
      message: "Internal server error",
      response: mockError.response,
      errorType: "server",
      timestamp: new Date().toISOString(),
    };
    showDebug.value = true;
  });

  const testValidationError = $(() => {
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

    errorHandler.value.handleError(mockValidationError, {
      handleFieldErrors: true,
      fieldMapping: {},
      debugLabel: "Test Validation Error",
    });

    debugInfo.value = {
      status: 422,
      message: "Validation failed",
      response: mockValidationError.response,
      errorType: "validation",
      timestamp: new Date().toISOString(),
    };
    showDebug.value = true;
  });

  // Simulate API call
  const simulateApiCall = $(async (data) => {
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
  });

  return (
    <div class="vormia-demo">
      <h1>VormiaQueryJS Debug & Notification System - Qwik</h1>

      {/* Notifications Container */}
      <div id="notifications"></div>

      {/* Form Section */}
      <div class="form-section">
        <h2>User Registration Form</h2>
        <form onSubmit$={handleSubmit}>
          <div class="form-group">
            <label for="name">Name:</label>
            <input
              type="text"
              id="name"
              value={formData.value.name}
              onInput$={(event) => handleInputChange("name", event)}
              class={`form-input ${getFieldErrorClass("name")}`}
              required
            />
            {fieldErrors.value.name && (
              <p class="error-message">{fieldErrors.value.name}</p>
            )}
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input
              type="email"
              id="email"
              value={formData.value.email}
              onInput$={(event) => handleInputChange("email", event)}
              class={`form-input ${getFieldErrorClass("email")}`}
              required
            />
            {fieldErrors.value.email && (
              <p class="error-message">{fieldErrors.value.email}</p>
            )}
          </div>

          <div class="form-group">
            <label for="password">Password:</label>
            <input
              type="password"
              id="password"
              value={formData.value.password}
              onInput$={(event) => handleInputChange("password", event)}
              class={`form-input ${getFieldErrorClass("password")}`}
              required
            />
            {fieldErrors.value.password && (
              <p class="error-message">{fieldErrors.value.password}</p>
            )}
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.value.confirmPassword}
              onInput$={(event) => handleInputChange("confirmPassword", event)}
              class={`form-input ${getFieldErrorClass("confirmPassword")}`}
              required
            />
            {fieldErrors.value.confirmPassword && (
              <p class="error-message">{fieldErrors.value.confirmPassword}</p>
            )}
          </div>

          {generalError.value && (
            <div class="general-error">
              <p class="error-message">{generalError.value}</p>
            </div>
          )}

          <div class="form-actions">
            <button type="submit" disabled={isSubmitting.value}>
              {isSubmitting.value ? "Registering..." : "Register"}
            </button>
            <button type="button" onClick$={clearAllErrors}>
              Clear Errors
            </button>
          </div>
        </form>
      </div>

      {/* Debug Section */}
      <div class="debug-section">
        <h2>Debug Panel</h2>
        <div id="debug-panel"></div>
      </div>

      {/* Controls */}
      <div class="controls">
        <button onClick$={testSuccess}>Test Success</button>
        <button onClick$={testError}>Test Error</button>
        <button onClick$={testValidationError}>Test Validation Error</button>
        <button onClick$={toggleDebug}>
          {showDebug.value ? "Hide Debug Panel" : "Show Debug Panel"}
        </button>
      </div>

      {/* Styles */}
      <style>{`
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

        .form-input.border-red-500 {
          border-color: #dc2626;
        }

        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 5px;
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
      `}</style>
    </div>
  );
}); 
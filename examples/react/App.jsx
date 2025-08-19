import React, { useState, useEffect } from "react";
import {
  useVormiaQueryAuthMutation,
  createEnhancedErrorHandler,
  createFieldErrorManager,
  showSuccessNotification,
  showErrorNotification,
  createErrorDebugPanel,
} from "vormiaqueryjs";

export default function App() {
  // State management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  // Initialize error handler and field error manager
  const [errorHandler] = useState(() =>
    createEnhancedErrorHandler({
      debugEnabled: true,
      showNotifications: true,
      showDebugPanel: true,
      notificationTarget: "#notifications",
      debugTarget: "#debug-panel",
    })
  );

  const [fieldErrorManager] = useState(() => createFieldErrorManager());

  // Set debug panel visibility on component mount
  useEffect(() => {
    const isDebugEnabled = import.meta.env.VITE_VORMIA_DEBUG === "true";
    setShowDebug(isDebugEnabled);

    // Show welcome notification
    showSuccessNotification(
      "Welcome to VormiaQueryJS Debug & Notification System!",
      "System Ready",
      "#notifications",
      3000
    );
  }, []);

  // Setup field error listener
  useEffect(() => {
    const removeListener = fieldErrorManager.addListener((errors) => {
      setFieldErrors(errors);
    });

    return removeListener;
  }, [fieldErrorManager]);

  // VormiaQueryJS mutation with integrated error handling
  const mutation = useVormiaQueryAuthMutation({
    endpoint: "/api/register",
    method: "POST",
    onSuccess: (data) => {
      // Handle success
      errorHandler.handleSuccess(data, {
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
              message: data?.data?.message || "Operation completed successfully",
              data: data?.data,
              debug: data?.debug,
            },
          },
          debug: data?.debug,
        },
        errorType: "success",
        timestamp: new Date().toISOString(),
      };

      setDebugInfo(debugInfo);
      setShowDebug(true);

      // Clear errors and reset form
      setFieldErrors({});
      setGeneralError("");
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    },

    onError: (error) => {
      // Handle error
      const errorInfo = errorHandler.handleError(error, {
        handleFieldErrors: true,
        fieldMapping: {
          password_confirmation: "confirmPassword",
        },
      });

      // Set debug info
      setDebugInfo(errorInfo);
      setShowDebug(true);

      // Clear general error if there are field errors
      if (Object.keys(fieldErrors).length > 0) {
        setGeneralError("");
      } else {
        setGeneralError(errorInfo.message);
      }
    },
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    fieldErrorManager.clearAllFieldErrors();
    setGeneralError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit form
    mutation.mutate(formData);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      fieldErrorManager.clearFieldError(name);
    }

    // Clear general error
    if (generalError) {
      setGeneralError("");
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newFieldErrors = {};

    // Required field validation
    if (!formData.name.trim()) {
      newFieldErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
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
  };

  // Test functions
  const testSuccess = () => {
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

    setDebugInfo({
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
    });
    setShowDebug(true);
  };

  const testError = () => {
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

    setDebugInfo({
      status: 500,
      message: "Internal server error",
      response: mockError.response,
      errorType: "server",
      timestamp: new Date().toISOString(),
    });
    setShowDebug(true);
  };

  const testValidationError = () => {
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

    setDebugInfo({
      status: 422,
      message: "Validation failed",
      response: mockValidationError.response,
      errorType: "validation",
      timestamp: new Date().toISOString(),
    });
    setShowDebug(true);
  };

  const clearAllErrors = () => {
    fieldErrorManager.clearAllFieldErrors();
    setGeneralError("");
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  // Get field error class
  const getFieldErrorClass = (fieldName) => {
    return fieldErrors[fieldName] ? "border-red-500" : "";
  };

  return (
    <div className="vormia-demo">
      <h1>VormiaQueryJS Debug & Notification System - React</h1>

      {/* Notifications Container */}
      <div id="notifications"></div>

      {/* Form Section */}
      <div className="form-section">
        <h2>User Registration Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${getFieldErrorClass("name")}`}
              required
            />
            {fieldErrors.name && (
              <p className="error-message">{fieldErrors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${getFieldErrorClass("email")}`}
              required
            />
            {fieldErrors.email && (
              <p className="error-message">{fieldErrors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${getFieldErrorClass("password")}`}
              required
            />
            {fieldErrors.password && (
              <p className="error-message">{fieldErrors.password}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${getFieldErrorClass("confirmPassword")}`}
              required
            />
            {fieldErrors.confirmPassword && (
              <p className="error-message">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {generalError && (
            <div className="general-error">
              <p className="error-message">{generalError}</p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Registering..." : "Register"}
            </button>
            <button type="button" onClick={clearAllErrors}>
              Clear Errors
            </button>
          </div>
        </form>
      </div>

      {/* Debug Section */}
      <div className="debug-section">
        <h2>Debug Panel</h2>
        <div id="debug-panel"></div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={testSuccess}>Test Success</button>
        <button onClick={testError}>Test Error</button>
        <button onClick={testValidationError}>Test Validation Error</button>
        <button onClick={toggleDebug}>
          {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
        </button>
      </div>

      {/* Styles */}
      <style jsx>{`
        .vormia-demo {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            sans-serif;
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
}

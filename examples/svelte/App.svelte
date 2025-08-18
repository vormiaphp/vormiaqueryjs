<script>
  import { onMount } from "svelte";
  import {
    createEnhancedErrorHandler,
    createFieldErrorManager,
    showSuccessNotification,
    showErrorNotification,
    createErrorDebugPanel,
  } from "vormiaqueryjs";

  // State management
  let formData = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
  let fieldErrors = {};
  let generalError = "";
  let debugInfo = null;
  let showDebug = false;
  let isSubmitting = false;
  let errorHandler = null;
  let fieldErrorManager = null;

  // Initialize components
  onMount(() => {
    initializeComponents();
    setupFieldErrorListener();
    showWelcomeNotification();
  });

  function initializeComponents() {
    // Initialize error handler
    errorHandler = createEnhancedErrorHandler({
      debugEnabled: true,
      showNotifications: true,
      showDebugPanel: true,
      notificationTarget: "#notifications",
      debugTarget: "#debug-panel",
    });

    // Initialize field error manager
    fieldErrorManager = createFieldErrorManager();

    // Set debug panel visibility
    showDebug = import.meta.env.VITE_VORMIA_DEBUG === "true";
  }

  function setupFieldErrorListener() {
    fieldErrorManager.addListener((errors) => {
      fieldErrors = errors;
    });
  }

  function showWelcomeNotification() {
    showSuccessNotification(
      "Welcome to VormiaQueryJS Debug & Notification System!",
      "System Ready",
      "#notifications",
      3000
    );
  }

  async function handleSubmit() {
    // Clear previous errors
    fieldErrorManager.clearAllFieldErrors();
    generalError = "";

    // Validate form
    if (!validateForm()) {
      return;
    }

    isSubmitting = true;

    try {
      // Simulate API call
      const response = await simulateApiCall(formData);

      // Handle success
      errorHandler.handleSuccess(response, {
        notificationMessage: "User registered successfully!",
        debugLabel: "User Registration Success",
      });

      // Set debug info
      debugInfo = {
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
      };

      showDebug = true;

      // Reset form
      formData = { name: "", email: "", password: "", confirmPassword: "" };
    } catch (error) {
      // Handle error
      const errorInfo = errorHandler.handleError(error, {
        handleFieldErrors: true,
        fieldMapping: {
          password_confirmation: "confirmPassword",
        },
      });

      // Set debug info
      debugInfo = errorInfo;
      showDebug = true;

      // Set general error if no field errors
      if (Object.keys(fieldErrors).length === 0) {
        generalError = errorInfo.message;
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleInputChange(fieldName) {
    // Clear field error when user starts typing
    if (fieldErrors[fieldName]) {
      fieldErrorManager.clearFieldError(fieldName);
    }

    // Clear general error
    if (generalError) {
      generalError = "";
    }
  }

  function validateForm() {
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
  }

  function clearAllErrors() {
    fieldErrorManager.clearAllFieldErrors();
    generalError = "";
  }

  function toggleDebug() {
    showDebug = !showDebug;
  }

  function getFieldErrorClass(fieldName) {
    return fieldErrors[fieldName] ? "border-red-500" : "";
  }

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

    debugInfo = {
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
    showDebug = true;
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

    debugInfo = {
      status: 500,
      message: "Internal server error",
      response: mockError.response,
      errorType: "server",
      timestamp: new Date().toISOString(),
    };
    showDebug = true;
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

    debugInfo = {
      status: 422,
      message: "Validation failed",
      response: mockValidationError.response,
      errorType: "validation",
      timestamp: new Date().toISOString(),
    };
    showDebug = true;
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
</script>

<div class="vormia-demo">
  <h1>VormiaQueryJS Debug & Notification System - Svelte</h1>

  <!-- Notifications Container -->
  <div id="notifications"></div>

  <!-- Form Section -->
  <div class="form-section">
    <h2>User Registration Form</h2>
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          type="text"
          id="name"
          bind:value={formData.name}
          on:input={() => handleInputChange("name")}
          class="form-input {getFieldErrorClass('name')}"
          required
        />
        {#if fieldErrors.name}
          <p class="error-message">{fieldErrors.name}</p>
        {/if}
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          bind:value={formData.email}
          on:input={() => handleInputChange("email")}
          class="form-input {getFieldErrorClass('email')}"
          required
        />
        {#if fieldErrors.email}
          <p class="error-message">{fieldErrors.email}</p>
        {/if}
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          bind:value={formData.password}
          on:input={() => handleInputChange("password")}
          class="form-input {getFieldErrorClass('password')}"
          required
        />
        {#if fieldErrors.password}
          <p class="error-message">{fieldErrors.password}</p>
        {/if}
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          bind:value={formData.confirmPassword}
          on:input={() => handleInputChange("confirmPassword")}
          class="form-input {getFieldErrorClass('confirmPassword')}"
          required
        />
        {#if fieldErrors.confirmPassword}
          <p class="error-message">{fieldErrors.confirmPassword}</p>
        {/if}
      </div>

      {#if generalError}
        <div class="general-error">
          <p class="error-message">{generalError}</p>
        </div>
      {/if}

      <div class="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        <button type="button" on:click={clearAllErrors}> Clear Errors </button>
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
    <button on:click={testSuccess}>Test Success</button>
    <button on:click={testError}>Test Error</button>
    <button on:click={testValidationError}>Test Validation Error</button>
    <button on:click={toggleDebug}>
      {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
    </button>
  </div>
</div>

<style>
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
</style>

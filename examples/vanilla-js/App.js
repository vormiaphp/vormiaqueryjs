/**
 * Vanilla JavaScript Example for VormiaQueryJS Debug & Notification System
 * Demonstrates ErrorDebugPanel, NotificationPanel, and fieldErrors usage
 */

import {
  createVormiaClient,
  createEnhancedErrorHandler,
  createFieldErrorManager,
  showSuccessNotification,
  showErrorNotification,
  createErrorDebugPanel,
} from "vormiaqueryjs";

// Initialize VormiaQueryJS client
const client = createVormiaClient({
  baseURL: "https://api.example.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Create enhanced error handler
const errorHandler = createEnhancedErrorHandler({
  debugEnabled: true,
  showNotifications: true,
  showDebugPanel: true,
  notificationTarget: "#notifications",
  debugTarget: "#debug-panel",
});

// Create field error manager
const fieldErrorManager = createFieldErrorManager();

// Form data
let formData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// DOM elements
let form, nameInput, emailInput, passwordInput, confirmPasswordInput;
let nameError, emailError, passwordError, confirmPasswordError;

// Initialize the application
function init() {
  setupDOM();
  setupEventListeners();
  setupFieldErrorListeners();

  // Show welcome notification
  showSuccessNotification(
    "Welcome to VormiaQueryJS Debug & Notification System!",
    "System Ready",
    "#notifications",
    3000
  );
}

// Setup DOM elements
function setupDOM() {
  // Create main container
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="vormia-demo">
      <h1>VormiaQueryJS Debug & Notification System</h1>
      
      <div id="notifications"></div>
      
      <div class="form-section">
        <h2>User Registration Form</h2>
        <form id="registration-form">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
            <div class="error-display" data-field="name"></div>
          </div>
          
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
            <div class="error-display" data-field="email"></div>
          </div>
          
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
            <div class="error-display" data-field="password"></div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required>
            <div class="error-display" data-field="confirmPassword"></div>
          </div>
          
          <button type="submit">Register</button>
          <button type="button" id="clear-errors">Clear Errors</button>
        </form>
      </div>
      
      <div class="debug-section">
        <h2>Debug Panel</h2>
        <div id="debug-panel"></div>
      </div>
      
      <div class="controls">
        <button id="test-success">Test Success</button>
        <button id="test-error">Test Error</button>
        <button id="test-validation">Test Validation Error</button>
        <button id="toggle-debug">Toggle Debug Panel</button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  // Get references to DOM elements
  form = document.getElementById("registration-form");
  nameInput = document.getElementById("name");
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");
  confirmPasswordInput = document.getElementById("confirmPassword");

  nameError = document.querySelector('[data-field="name"]');
  emailError = document.querySelector('[data-field="email"]');
  passwordError = document.querySelector('[data-field="password"]');
  confirmPasswordError = document.querySelector(
    '[data-field="confirmPassword"]'
  );
}

// Setup event listeners
function setupEventListeners() {
  // Form submission
  form.addEventListener("submit", handleFormSubmit);

  // Input change events for clearing errors
  nameInput.addEventListener("input", () =>
    fieldErrorManager.clearOnInput(fieldErrorManager, "name")
  );
  emailInput.addEventListener("input", () =>
    fieldErrorManager.clearOnInput(fieldErrorManager, "email")
  );
  passwordInput.addEventListener("input", () =>
    fieldErrorManager.clearOnInput(fieldErrorManager, "password")
  );
  confirmPasswordInput.addEventListener("input", () =>
    fieldErrorManager.clearOnInput(fieldErrorManager, "confirmPassword")
  );

  // Control buttons
  document
    .getElementById("clear-errors")
    .addEventListener("click", clearAllErrors);
  document
    .getElementById("test-success")
    .addEventListener("click", testSuccess);
  document.getElementById("test-error").addEventListener("click", testError);
  document
    .getElementById("test-validation")
    .addEventListener("click", testValidationError);
  document
    .getElementById("toggle-debug")
    .addEventListener("click", toggleDebugPanel);
}

// Setup field error listeners
function setupFieldErrorListeners() {
  fieldErrorManager.addListener((fieldErrors) => {
    updateFieldErrorDisplays(fieldErrors);
  });
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  // Clear previous errors
  fieldErrorManager.clearAllFieldErrors();

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

  try {
    // Simulate API call
    const response = await simulateApiCall(formData);

    // Handle success
    errorHandler.handleSuccess(response, {
      notificationMessage: "User registered successfully!",
      debugLabel: "User Registration Success",
    });

    // Reset form
    form.reset();
    formData = { name: "", email: "", password: "", confirmPassword: "" };
  } catch (error) {
    // Handle error
    errorHandler.handleError(error, {
      handleFieldErrors: true,
      fieldMapping: {
        password_confirmation: "confirmPassword",
      },
    });
  }
}

// Validate form
function validateForm() {
  let isValid = true;

  // Required field validation
  if (!formData.name) {
    fieldErrorManager.setFieldError("name", "Name is required");
    isValid = false;
  }

  if (!formData.email) {
    fieldErrorManager.setFieldError("email", "Email is required");
    isValid = false;
  } else if (!fieldErrorUtils.validateEmail(formData.email)) {
    fieldErrorManager.setFieldError(
      "email",
      "Please enter a valid email address"
    );
    isValid = false;
  }

  if (!formData.password) {
    fieldErrorManager.setFieldError("password", "Password is required");
    isValid = false;
  } else if (!fieldErrorUtils.validatePassword(formData.password)) {
    fieldErrorManager.setFieldError(
      "password",
      "Password must be at least 8 characters with uppercase, lowercase, and number"
    );
    isValid = false;
  }

  if (!formData.confirmPassword) {
    fieldErrorManager.setFieldError(
      "confirmPassword",
      "Please confirm your password"
    );
    isValid = false;
  } else if (
    !fieldErrorUtils.validatePasswordConfirmation(
      formData.password,
      formData.confirmPassword
    )
  ) {
    fieldErrorManager.setFieldError(
      "confirmPassword",
      "Passwords do not match"
    );
    isValid = false;
  }

  return isValid;
}

// Update field error displays
function updateFieldErrorDisplays(fieldErrors) {
  // Clear all error displays
  [nameError, emailError, passwordError, confirmPasswordError].forEach((el) => {
    if (el) el.innerHTML = "";
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
  nameInput.className = fieldErrorManager.getFieldClasses(
    "name",
    "form-input",
    "error"
  );
  emailInput.className = fieldErrorManager.getFieldClasses(
    "email",
    "form-input",
    "error"
  );
  passwordInput.className = fieldErrorManager.getFieldClasses(
    "password",
    "form-input",
    "error"
  );
  confirmPasswordInput.className = fieldErrorManager.getFieldClasses(
    "confirmPassword",
    "form-input",
    "error"
  );
}

// Clear all errors
function clearAllErrors() {
  fieldErrorManager.clearAllFieldErrors();
  updateFieldClasses();
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

// Add styles
function addStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .vormia-demo {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  `;

  document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    addStyles();
    init();
  });
} else {
  addStyles();
  init();
}

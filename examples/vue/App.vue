<script setup>
import { useVormiaQuery } from "vormiaqueryjs/adapters/vue";

const { data, error, isLoading } = useVormiaQuery({
  endpoint: "/categories",
  method: "GET",
});
</script>

<template>
  <div class="vormia-demo">
    <h1>VormiaQueryJS Debug & Notification System - Vue</h1>

    <!-- Notifications Container -->
    <div id="notifications"></div>

    <!-- Form Section -->
    <div class="form-section">
      <h2>User Registration Form</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Name:</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            @input="handleInputChange('name')"
            :class="['form-input', getFieldErrorClass('name')]"
            required
          />
          <p v-if="fieldErrors.name" class="error-message">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            @input="handleInputChange('email')"
            :class="['form-input', getFieldErrorClass('email')]"
            required
          />
          <p v-if="fieldErrors.email" class="error-message">
            {{ fieldErrors.email }}
          </p>
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            v-model="formData.password"
            @input="handleInputChange('password')"
            :class="['form-input', getFieldErrorClass('password')]"
            required
          />
          <p v-if="fieldErrors.password" class="error-message">
            {{ fieldErrors.password }}
          </p>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="formData.confirmPassword"
            @input="handleInputChange('confirmPassword')"
            :class="['form-input', getFieldErrorClass('confirmPassword')]"
            required
          />
          <p v-if="fieldErrors.confirmPassword" class="error-message">
            {{ fieldErrors.confirmPassword }}
          </p>
        </div>

        <div v-if="generalError" class="general-error">
          <p class="error-message">{{ generalError }}</p>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'Registering...' : 'Register' }}
          </button>
          <button type="button" @click="clearAllErrors">
            Clear Errors
          </button>
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
      <button @click="testSuccess">Test Success</button>
      <button @click="testError">Test Error</button>
      <button @click="testValidationError">Test Validation Error</button>
      <button @click="toggleDebug">
        {{ showDebug ? 'Hide Debug Panel' : 'Show Debug Panel' }}
      </button>
    </div>
  </div>
</template>

<script>
import {
  createEnhancedErrorHandler,
  createFieldErrorManager,
  showSuccessNotification,
  showErrorNotification,
  createErrorDebugPanel,
} from "vormiaqueryjs";

export default {
  name: "App",
  data() {
    return {
      formData: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      fieldErrors: {},
      generalError: "",
      debugInfo: null,
      showDebug: false,
      isSubmitting: false,
      errorHandler: null,
      fieldErrorManager: null,
    };
  },
  mounted() {
    this.initializeComponents();
    this.setupFieldErrorListener();
    this.showWelcomeNotification();
  },
  methods: {
    initializeComponents() {
      // Initialize error handler
      this.errorHandler = createEnhancedErrorHandler({
        debugEnabled: true,
        showNotifications: true,
        showDebugPanel: true,
        notificationTarget: "#notifications",
        debugTarget: "#debug-panel",
      });

      // Initialize field error manager
      this.fieldErrorManager = createFieldErrorManager();

      // Set debug panel visibility
      this.showDebug = import.meta.env.VITE_VORMIA_DEBUG === "true";
    },

    setupFieldErrorListener() {
      this.fieldErrorManager.addListener((errors) => {
        this.fieldErrors = errors;
      });
    },

    showWelcomeNotification() {
      showSuccessNotification(
        "Welcome to VormiaQueryJS Debug & Notification System!",
        "System Ready",
        "#notifications",
        3000
      );
    },

    async handleSubmit() {
      // Clear previous errors
      this.fieldErrorManager.clearAllFieldErrors();
      this.generalError = "";

      // Validate form
      if (!this.validateForm()) {
        return;
      }

      this.isSubmitting = true;

      try {
        // Simulate API call
        const response = await this.simulateApiCall(this.formData);

        // Handle success
        this.errorHandler.handleSuccess(response, {
          notificationMessage: "User registered successfully!",
          debugLabel: "User Registration Success",
        });

        // Set debug info
        this.setDebugInfo({
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
        });

        this.showDebug = true;

        // Reset form
        this.formData = { name: "", email: "", password: "", confirmPassword: "" };
      } catch (error) {
        // Handle error
        const errorInfo = this.errorHandler.handleError(error, {
          handleFieldErrors: true,
          fieldMapping: {
            password_confirmation: "confirmPassword",
          },
        });

        // Set debug info
        this.setDebugInfo(errorInfo);
        this.showDebug = true;

        // Set general error if no field errors
        if (Object.keys(this.fieldErrors).length === 0) {
          this.generalError = errorInfo.message;
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    handleInputChange(fieldName) {
      // Clear field error when user starts typing
      if (this.fieldErrors[fieldName]) {
        this.fieldErrorManager.clearFieldError(fieldName);
      }

      // Clear general error
      if (this.generalError) {
        this.generalError = "";
      }
    },

    validateForm() {
      let isValid = true;
      const newFieldErrors = {};

      // Required field validation
      if (!this.formData.name.trim()) {
        newFieldErrors.name = "Name is required";
        isValid = false;
      }

      if (!this.formData.email.trim()) {
        newFieldErrors.email = "Email is required";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
        newFieldErrors.email = "Please enter a valid email address";
        isValid = false;
      }

      if (!this.formData.password) {
        newFieldErrors.password = "Password is required";
        isValid = false;
      } else if (this.formData.password.length < 8) {
        newFieldErrors.password = "Password must be at least 8 characters long";
        isValid = false;
      }

      if (!this.formData.confirmPassword) {
        newFieldErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (this.formData.password !== this.formData.confirmPassword) {
        newFieldErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }

      // Set field errors
      this.fieldErrorManager.setFieldErrors(newFieldErrors);

      return isValid;
    },

    clearAllErrors() {
      this.fieldErrorManager.clearAllFieldErrors();
      this.generalError = "";
    },

    toggleDebug() {
      this.showDebug = !this.showDebug;
    },

    getFieldErrorClass(fieldName) {
      return this.fieldErrors[fieldName] ? "border-red-500" : "";
    },

    setDebugInfo(debugInfo) {
      this.debugInfo = debugInfo;
    },

    testSuccess() {
      const mockResponse = {
        data: {
          success: true,
          message: "Test operation completed successfully",
          data: { id: 123, status: "active" },
          debug: { timestamp: new Date().toISOString() },
        },
      };

      this.errorHandler.handleSuccess(mockResponse, {
        notificationMessage: "Test success operation completed!",
        debugLabel: "Test Success",
      });

      this.setDebugInfo({
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
      this.showDebug = true;
    },

    testError() {
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

      this.errorHandler.handleError(mockError, {
        debugLabel: "Test Server Error",
      });

      this.setDebugInfo({
        status: 500,
        message: "Internal server error",
        response: mockError.response,
        errorType: "server",
        timestamp: new Date().toISOString(),
      });
      this.showDebug = true;
    },

    testValidationError() {
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

      this.errorHandler.handleError(mockValidationError, {
        handleFieldErrors: true,
        fieldMapping: {},
        debugLabel: "Test Validation Error",
      });

      this.setDebugInfo({
        status: 422,
        message: "Validation failed",
        response: mockValidationError.response,
        errorType: "validation",
        timestamp: new Date().toISOString(),
      });
      this.showDebug = true;
    },

    // Simulate API call
    async simulateApiCall(data) {
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
    },
  },
};
</script>

<style scoped>
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
</style>

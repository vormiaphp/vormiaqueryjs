---
// Astro component script
---

<div class="max-w-2xl mx-auto p-6 space-y-6">
  <h1 class="text-3xl font-bold text-center mb-8">
    VormiaQueryJS Astro Example
  </h1>

  <!-- Notification Display -->
  <div id="notificationContainer"></div>

  <!-- Registration Form -->
  <div class="bg-white shadow-md rounded-lg p-6">
    <h2 class="text-2xl font-semibold mb-6">User Registration</h2>
    
    <form id="registration-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your full name"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div class="field-error mt-2" data-field="name"></div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div class="field-error mt-2" data-field="email"></div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div class="field-error mt-2" data-field="password"></div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        id="submit-btn"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Account
      </button>
    </form>

    <!-- General Error Display -->
    <div id="general-error" class="mt-4"></div>
  </div>

  <!-- Status Information -->
  <div id="status-display" class="bg-gray-50 p-4 rounded-lg">
    <h3 class="font-semibold mb-2">Form Status</h3>
    <div class="space-y-1 text-sm text-gray-600">
      <p>Loading: No</p>
      <p>Has Data: No</p>
      <p>Has Error: No</p>
      <p>Field Errors: 0</p>
      <p>General Error: No</p>
    </div>
  </div>
</div>

<script>
  // Initialize when DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    init();
  });

  function init() {
    // Show welcome notification
    showNotification('success', 'Welcome to VormiaQueryJS Astro Example!', 'System Ready');
    
    // Bind form events
    bindFormEvents();
  }

  function bindFormEvents() {
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');
    
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }
    
    // Input change events
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        clearFieldError(input.name);
      });
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const form = event.target;
    const formData = new FormData(form);
    
    // Clear previous errors
    clearAllFieldErrors();
    clearGeneralError();
    
    // Update button state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    try {
      // Simulate API call with form data transformation
      const transformedData = transformFormData(Object.fromEntries(formData));
      
      // Simulate API response
      await simulateApiCall(transformedData);
      
      // Success
      showNotification('success', 'Account created successfully!', 'Success');
      updateStatus(true, false);
      
      // Reset form
      form.reset();
      
    } catch (error) {
      // Error
      showNotification('error', error.message || 'Registration failed', 'Error');
      updateStatus(false, true);
      
      // Handle field errors if available
      if (error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
        clearGeneralError();
      } else {
        setGeneralError(error.message || 'Registration failed');
        clearAllFieldErrors();
      }
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }

  function transformFormData(formData) {
    // Simulate the form data transformation that VormiaQueryJS does
    return {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.confirmPassword, // Renamed
      terms: true, // Added
      source: 'web' // Added
      // confirmPassword removed
    };
  }

  async function simulateApiCall(data) {
    // Simulate API call with random success/failure
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          // Success
          resolve({ success: true, data });
        } else {
          // Error - simulate validation errors
          reject({
            message: 'Validation failed',
            fieldErrors: {
              name: ['Name must be at least 2 characters'],
              email: ['Email format is invalid'],
              password: ['Password is too weak']
            }
          });
        }
      }, 1000);
    });
  }

  function showNotification(type, message, title = '') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    const classes = getNotificationClasses(type);
    const icon = getNotificationIcon(type);
    
    container.innerHTML = `
      <div class="notification-panel">
        <div class="${classes}">
          <div class="flex items-center">
            <span class="text-lg mr-3">${icon}</span>
            <div class="flex-1">
              ${title ? `<h3 class="font-semibold text-sm">${title}</h3>` : ''}
              <p class="text-sm">${message}</p>
            </div>
            <button onclick="closeNotification()" class="ml-3 hover:opacity-70 transition-opacity">
              ✕
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function closeNotification() {
    const container = document.getElementById('notificationContainer');
    if (container) {
      container.innerHTML = '';
    }
  }

  function setFieldErrors(errors) {
    Object.keys(errors).forEach(field => {
      const errorContainer = document.querySelector(`[data-field="${field}"]`);
      if (errorContainer) {
        errorContainer.innerHTML = `
          <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-white">${errors[field]}</p>
              <button onclick="clearFieldError('${field}')" class="ml-auto text-white hover:text-gray-200">
                ✕
              </button>
            </div>
          </div>
        `;
      }
    });
  }

  function clearFieldError(field) {
    const errorContainer = document.querySelector(`[data-field="${field}"]`);
    if (errorContainer) {
      errorContainer.innerHTML = '';
    }
  }

  function clearAllFieldErrors() {
    const errorContainers = document.querySelectorAll('.field-error');
    errorContainers.forEach(container => {
      container.innerHTML = '';
    });
  }

  function setGeneralError(message) {
    const container = document.getElementById('general-error');
    if (container) {
      container.innerHTML = `
        <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm text-white flex-1">${message}</p>
            <button onclick="clearGeneralError()" class="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>
      `;
    }
  }

  function clearGeneralError() {
    const container = document.getElementById('general-error');
    if (container) {
      container.innerHTML = '';
    }
  }

  function updateStatus(hasData, hasError) {
    const statusContainer = document.getElementById('status-display');
    if (statusContainer) {
      const fieldErrors = document.querySelectorAll('.field-error').length;
      const generalError = document.getElementById('general-error').innerHTML !== '';
      
      statusContainer.innerHTML = `
        <h3 class="font-semibold mb-2">Form Status</h3>
        <div class="space-y-1 text-sm text-gray-600">
          <p>Loading: No</p>
          <p>Has Data: ${hasData ? 'Yes' : 'No'}</p>
          <p>Has Error: ${hasError ? 'Yes' : 'No'}</p>
          <p>Field Errors: ${fieldErrors}</p>
          <p>General Error: ${generalError ? 'Yes' : 'No'}</p>
        </div>
      `;
    }
  }

  function getNotificationClasses(type) {
    const baseClasses = 'border rounded-lg p-4';
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-500 border-red-200 text-white`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-800`;
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }
</script>

<style>
  .notification-panel {
    position: sticky;
    top: 0;
    z-index: 50;
  }
</style> 
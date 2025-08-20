/**
 * VormiaQueryJS Vanilla JavaScript Example
 * This demonstrates how to use the package in non-framework environments
 */

class VormiaQueryJSExample {
  constructor() {
    this.formData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    this.fieldErrors = {};
    this.generalError = '';
    this.notification = null;
    this.isLoading = false;
    this.hasData = false;
    this.hasError = false;
    
    this.init();
  }
  
  init() {
    this.render();
    this.bindEvents();
    this.showNotification('success', 'Welcome to VormiaQueryJS Vanilla JS Example!', 'System Ready');
  }
  
  bindEvents() {
    // Form submission
    const form = document.getElementById('registrationForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    // Input changes
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.formData[e.target.name] = e.target.value;
        this.clearFieldError(e.target.name);
      });
    });
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    // Clear previous errors
    this.fieldErrors = {};
    this.generalError = '';
    this.isLoading = true;
    this.updateUI();
    
    try {
      // Simulate API call with form data transformation
      const transformedData = this.transformFormData(this.formData);
      
      // Simulate API response
      await this.simulateApiCall(transformedData);
      
      // Success
      this.showNotification('success', 'Account created successfully!', 'Success');
      this.hasData = true;
      this.hasError = false;
      
      // Reset form
      this.formData = { name: '', email: '', password: '', confirmPassword: '' };
      this.resetForm();
      
    } catch (error) {
      // Error
      this.showNotification('error', error.message || 'Registration failed', 'Error');
      this.hasError = true;
      this.hasData = false;
      
      // Handle field errors if available
      if (error.fieldErrors) {
        this.fieldErrors = error.fieldErrors;
        this.generalError = '';
      } else {
        this.generalError = error.message || 'Registration failed';
        this.fieldErrors = {};
      }
    } finally {
      this.isLoading = false;
      this.updateUI();
    }
  }
  
  transformFormData(formData) {
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
  
  async simulateApiCall(data) {
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
  
  showNotification(type, message, title = '') {
    this.notification = { type, message, title };
    this.renderNotification();
  }
  
  closeNotification() {
    this.notification = null;
    this.renderNotification();
  }
  
  clearFieldError(field) {
    delete this.fieldErrors[field];
    this.updateUI();
  }
  
  clearGeneralError() {
    this.generalError = '';
    this.updateUI();
  }
  
  resetForm() {
    const form = document.getElementById('registrationForm');
    if (form) {
      form.reset();
    }
  }
  
  updateUI() {
    this.updateFormFields();
    this.updateErrorDisplay();
    this.updateStatusDisplay();
  }
  
  updateFormFields() {
    // Update input values
    Object.keys(this.formData).forEach(field => {
      const input = document.querySelector(`input[name="${field}"]`);
      if (input) {
        input.value = this.formData[field];
      }
    });
    
    // Update submit button
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = this.isLoading;
      submitBtn.textContent = this.isLoading ? 'Creating Account...' : 'Create Account';
    }
  }
  
  updateErrorDisplay() {
    // Clear all existing error displays
    document.querySelectorAll('.field-error').forEach(el => el.remove());
    const generalErrorEl = document.getElementById('generalError');
    if (generalErrorEl) {
      generalErrorEl.innerHTML = '';
    }
    
    // Show field errors
    Object.keys(this.fieldErrors).forEach(field => {
      const input = document.querySelector(`input[name="${field}"]`);
      if (input) {
        const errorDiv = this.createFieldErrorElement(field, this.fieldErrors[field]);
        input.parentNode.appendChild(errorDiv);
      }
    });
    
    // Show general error
    if (this.generalError) {
      const generalErrorEl = document.getElementById('generalError');
      if (generalErrorEl) {
        generalErrorEl.innerHTML = this.createGeneralErrorElement();
      }
    }
  }
  
  updateStatusDisplay() {
    const statusEl = document.getElementById('statusDisplay');
    if (statusEl) {
      statusEl.innerHTML = `
        <h3 class="font-semibold mb-2">Form Status</h3>
        <div class="space-y-1 text-sm text-gray-600">
          <p>Loading: ${this.isLoading ? 'Yes' : 'No'}</p>
          <p>Has Data: ${this.hasData ? 'Yes' : 'No'}</p>
          <p>Has Error: ${this.hasError ? 'Yes' : 'No'}</p>
          <p>Field Errors: ${Object.keys(this.fieldErrors).length}</p>
          <p>General Error: ${this.generalError ? 'Yes' : 'No'}</p>
        </div>
      `;
    }
  }
  
  createFieldErrorElement(field, message) {
    const div = document.createElement('div');
    div.className = 'field-error mt-2';
    div.innerHTML = `
      <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-white">${message}</p>
          <button onclick="app.clearFieldError('${field}')" class="ml-auto text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      </div>
    `;
    return div;
  }
  
  createGeneralErrorElement() {
    return `
      <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-white flex-1">${this.generalError}</p>
          <button onclick="app.clearGeneralError()" class="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      </div>
    `;
  }
  
  renderNotification() {
    const container = document.getElementById('notificationContainer');
    if (!container) return;
    
    if (this.notification) {
      const classes = this.getNotificationClasses();
      const icon = this.getNotificationIcon();
      
      container.innerHTML = `
        <div class="notification-panel">
          <div class="${classes}">
            <div class="flex items-center">
              <span class="text-lg mr-3">${icon}</span>
              <div class="flex-1">
                ${this.notification.title ? `<h3 class="font-semibold text-sm">${this.notification.title}</h3>` : ''}
                <p class="text-sm">${this.notification.message}</p>
              </div>
              <button onclick="app.closeNotification()" class="ml-3 hover:opacity-70 transition-opacity">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = '';
    }
  }
  
  getNotificationClasses() {
    const baseClasses = 'border rounded-lg p-4';
    switch (this.notification?.type) {
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
  
  getNotificationIcon() {
    switch (this.notification?.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }
  
  render() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
      <div class="max-w-2xl mx-auto p-6 space-y-6">
        <h1 class="text-3xl font-bold text-center mb-8">
          VormiaQueryJS Vanilla JS Example
        </h1>

        <!-- Notification Display -->
        <div id="notificationContainer"></div>

        <!-- Registration Form -->
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-2xl font-semibold mb-6">User Registration</h2>
          
          <form id="registrationForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Account
            </button>
          </form>

          <!-- General Error Display -->
          <div id="generalError" class="mt-4"></div>
        </div>

        <!-- Status Information -->
        <div id="statusDisplay" class="bg-gray-50 p-4 rounded-lg">
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
    `;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new VormiaQueryJSExample();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VormiaQueryJSExample;
}

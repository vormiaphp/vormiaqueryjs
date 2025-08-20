import { component$, useSignal, useVisibleTask$, $ } from "@builder.io/qwik";

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
  const notification = useSignal(null);
  const isLoading = useSignal(false);
  const hasData = useSignal(false);
  const hasError = useSignal(false);

  // Initialize on mount
  useVisibleTask$(() => {
    showNotification('success', 'Welcome to VormiaQueryJS Qwik Example!', 'System Ready');
  });

  const handleSubmit = $(async (event) => {
    event.preventDefault();

    // Clear previous errors
    fieldErrors.value = {};
    generalError.value = "";
    isLoading.value = true;

    try {
      // Simulate API call with form data transformation
      const transformedData = transformFormData(formData.value);
      
      // Simulate API response
      await simulateApiCall(transformedData);
      
      // Success
      showNotification('success', 'Account created successfully!', 'Success');
      hasData.value = true;
      hasError.value = false;
      
      // Reset form
      formData.value = { name: "", email: "", password: "", confirmPassword: "" };
      
    } catch (error) {
      // Error
      showNotification('error', error.message || 'Registration failed', 'Error');
      hasError.value = true;
      hasData.value = false;
      
      // Handle field errors if available
      if (error.fieldErrors) {
        fieldErrors.value = error.fieldErrors;
        generalError.value = "";
      } else {
        generalError.value = error.message || 'Registration failed';
        fieldErrors.value = {};
      }
    } finally {
      isLoading.value = false;
    }
  });

  const transformFormData = $((formData) => {
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
  });

  const simulateApiCall = $(async (data) => {
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
  });

  const showNotification = $((type, message, title = '') => {
    notification.value = { type, message, title };
  });

  const closeNotification = $(() => {
    notification.value = null;
  });

  const clearFieldError = $((field) => {
    fieldErrors.value = { ...fieldErrors.value, [field]: "" };
  });

  const clearGeneralError = $(() => {
    generalError.value = "";
  });

  const getNotificationClasses = $((type) => {
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
  });

  const getNotificationIcon = $((type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  });

  return (
    <div class="max-w-2xl mx-auto p-6 space-y-6">
      <h1 class="text-3xl font-bold text-center mb-8">
        VormiaQueryJS Qwik Example
      </h1>

      {/* Notification Display */}
      {notification.value && (
        <div class="notification-panel">
          <div class={getNotificationClasses(notification.value.type)}>
            <div class="flex items-center">
              <span class="text-lg mr-3">{getNotificationIcon(notification.value.type)}</span>
              <div class="flex-1">
                {notification.value.title && (
                  <h3 class="font-semibold text-sm">{notification.value.title}</h3>
                )}
                <p class="text-sm">{notification.value.message}</p>
              </div>
              <button onClick$={closeNotification} class="ml-3 hover:opacity-70 transition-opacity">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-6">User Registration</h2>
        
        <form onSubmit$={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={formData.value.name}
              onInput$={(e) => formData.value = { ...formData.value, name: e.target.value }}
              placeholder="Enter your full name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.value.name && (
              <div class="mt-2">
                <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-white">{fieldErrors.value.name}</p>
                    <button onClick$={() => clearFieldError('name')} class="ml-auto text-white hover:text-gray-200">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.value.email}
              onInput$={(e) => formData.value = { ...formData.value, email: e.target.value }}
              placeholder="Enter your email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.value.email && (
              <div class="mt-2">
                <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-white">{fieldErrors.value.email}</p>
                    <button onClick$={() => clearFieldError('email')} class="ml-auto text-white hover:text-gray-200">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={formData.value.password}
              onInput$={(e) => formData.value = { ...formData.value, password: e.target.value }}
              placeholder="Enter your password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors.value.password && (
              <div class="mt-2">
                <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-white">{fieldErrors.value.password}</p>
                    <button onClick$={() => clearFieldError('password')} class="ml-auto text-white hover:text-gray-200">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.value.confirmPassword}
              onInput$={(e) => formData.value = { ...formData.value, confirmPassword: e.target.value }}
              placeholder="Confirm your password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading.value}
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading.value ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* General Error Display */}
        {generalError.value && (
          <div class="mt-4">
            <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-white flex-1">{generalError.value}</p>
                <button onClick$={clearGeneralError} class="text-white hover:text-gray-200">
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Information */}
      <div class="bg-gray-50 p-4 rounded-lg">
        <h3 class="font-semibold mb-2">Form Status</h3>
        <div class="space-y-1 text-sm text-gray-600">
          <p>Loading: {isLoading.value ? 'Yes' : 'No'}</p>
          <p>Has Data: {hasData.value ? 'Yes' : 'No'}</p>
          <p>Has Error: {hasError.value ? 'Yes' : 'No'}</p>
          <p>Field Errors: {Object.keys(fieldErrors.value).length}</p>
          <p>General Error: {generalError.value ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
}); 
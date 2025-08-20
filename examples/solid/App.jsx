import { createSignal, onMount } from "solid-js";

export default function App() {
  // State management
  const [formData, setFormData] = createSignal({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = createSignal({});
  const [generalError, setGeneralError] = createSignal("");
  const [notification, setNotification] = createSignal(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [hasData, setHasData] = createSignal(false);
  const [hasError, setHasError] = createSignal(false);

  // Set welcome notification on mount
  onMount(() => {
    showNotification('success', 'Welcome to VormiaQueryJS Solid Example!', 'System Ready');
  });

  async function handleSubmit(event) {
    event.preventDefault();

    // Clear previous errors
    setFieldErrors({});
    setGeneralError("");
    setIsLoading(true);

    try {
      // Simulate API call with form data transformation
      const transformedData = transformFormData(formData());
      
      // Simulate API response
      await simulateApiCall(transformedData);
      
      // Success
      showNotification('success', 'Account created successfully!', 'Success');
      setHasData(true);
      setHasError(false);
      
      // Reset form
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      
    } catch (error) {
      // Error
      showNotification('error', error.message || 'Registration failed', 'Error');
      setHasError(true);
      setHasData(false);
      
      // Handle field errors if available
      if (error.fieldErrors) {
        setFieldErrors(error.fieldErrors);
        setGeneralError("");
      } else {
        setGeneralError(error.message || 'Registration failed');
        setFieldErrors({});
      }
    } finally {
      setIsLoading(false);
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
    setNotification({ type, message, title });
  }

  function closeNotification() {
    setNotification(null);
  }

  function clearFieldError(field) {
    setFieldErrors(prev => ({ ...prev, [field]: "" }));
  }

  function clearGeneralError() {
    setGeneralError("");
  }

  function getNotificationClasses() {
    const baseClasses = 'border rounded-lg p-4';
    switch (notification()?.type) {
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

  function getNotificationIcon() {
    switch (notification()?.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  return (
    <div class="max-w-2xl mx-auto p-6 space-y-6">
      <h1 class="text-3xl font-bold text-center mb-8">
        VormiaQueryJS Solid Example
      </h1>

      {/* Notification Display */}
      {notification() && (
        <div class="notification-panel">
          <div class={getNotificationClasses()}>
            <div class="flex items-center">
              <span class="text-lg mr-3">{getNotificationIcon()}</span>
              <div class="flex-1">
                {notification()?.title && (
                  <h3 class="font-semibold text-sm">{notification()?.title}</h3>
                )}
                <p class="text-sm">{notification()?.message}</p>
              </div>
              <button onClick={closeNotification} class="ml-3 hover:opacity-70 transition-opacity">
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-2xl font-semibold mb-6">User Registration</h2>
        
        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="name"
              type="text"
              value={formData().name}
              onInput={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors().name && (
              <div class="mt-2">
                <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-white">{fieldErrors().name}</p>
                    <button onClick={() => clearFieldError('name')} class="ml-auto text-white hover:text-gray-200">
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
              value={formData().email}
              onInput={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors().email && (
              <div class="mt-2">
                <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-white">{fieldErrors().email}</p>
                    <button onClick={() => clearFieldError('email')} class="ml-auto text-white hover:text-gray-200">
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
              value={formData().password}
              onInput={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {fieldErrors().password && (
              <div class="mt-2">
                <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
                  <div class="flex items-center">
                    <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <p class="text-sm text-white">{fieldErrors().password}</p>
                    <button onClick={() => clearFieldError('password')} class="ml-auto text-white hover:text-gray-200">
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
              value={formData().confirmPassword}
              onInput={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm your password"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading()}
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading() ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* General Error Display */}
        {generalError() && (
          <div class="mt-4">
            <div class="p-4 bg-red-500 border border-red-200 rounded-lg text-white">
              <div class="flex items-center">
                <svg class="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-white flex-1">{generalError()}</p>
                <button onClick={clearGeneralError} class="text-white hover:text-gray-200">
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
          <p>Loading: {isLoading() ? 'Yes' : 'No'}</p>
          <p>Has Data: {hasData() ? 'Yes' : 'No'}</p>
          <p>Has Error: {hasError() ? 'Yes' : 'No'}</p>
          <p>Field Errors: {Object.keys(fieldErrors()).length}</p>
          <p>General Error: {generalError() ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
} 
<script>
  import { onMount } from 'svelte'
  import { VormiaRouteGuard } from 'vormiaqueryjs'
  import { useVrmAuthEnhancedSvelte } from 'vormiaqueryjs'

  // Enhanced authentication hook
  const auth = useVrmAuthEnhancedSvelte()

  // Reactive state
  let loginForm = {
    email: '',
    password: '',
    rememberMe: false
  }

  let formData = {
    name: '',
    email: '',
    message: ''
  }

  let selectedTheme = 'light'
  let notificationsEnabled = true
  let cacheStats = null

  // Methods
  const handleLogin = async () => {
    const result = await auth.login(loginForm)
    if (result.success) {
      console.log('Login successful:', result.user)
      // Reset form
      loginForm = { email: '', password: '', rememberMe: false }
    } else {
      console.error('Login failed:', result.error)
    }
  }

  const handleLogout = async () => {
    const result = await auth.logout()
    if (result.success) {
      console.log('Logout successful')
    } else {
      console.error('Logout failed:', result.error)
    }
  }

  const handleAuthorized = (event) => {
    console.log('Access granted:', event.detail)
  }

  const handleUnauthorized = (event) => {
    console.log('Access denied:', event.detail)
  }

  const adminAction = () => {
    console.log('Admin action executed')
  }

  const moderatorAction = () => {
    console.log('Moderator action executed')
  }

  const userManagementAction = () => {
    console.log('User management action executed')
  }

  const premiumAction = () => {
    console.log('Premium action executed')
  }

  const validatePremiumUser = (user) => {
    return user && user.subscription === 'premium'
  }

  const updateTheme = (event) => {
    const theme = event.target.value
    auth.setUserPreference('theme', theme)
    selectedTheme = theme
    console.log('Theme updated:', theme)
  }

  const updateNotifications = (event) => {
    const enabled = event.target.checked
    auth.setUserPreference('notifications', enabled)
    notificationsEnabled = enabled
    console.log('Notifications updated:', enabled)
  }

  const saveFormData = () => {
    auth.saveFormData('contact-form', formData)
    console.log('Form data saved')
  }

  const loadFormData = () => {
    const saved = auth.loadFormData('contact-form')
    if (saved) {
      formData = { ...saved }
      console.log('Form data loaded')
    }
  }

  const clearFormData = () => {
    auth.clearFormData('contact-form')
    formData = { name: '', email: '', message: '' }
    console.log('Form data cleared')
  }

  const clearCache = () => {
    // This would use the cache store directly
    console.log('Cache cleared')
  }

  const getCacheStats = () => {
    // This would use the cache store directly
    cacheStats = {
      itemCount: 25,
      totalSize: 1024000,
      hitRate: 85
    }
  }

  // Load saved preferences on mount
  onMount(() => {
    const savedTheme = auth.getUserPreference('theme', 'light')
    const savedNotifications = auth.getUserPreference('notifications', true)
    
    selectedTheme = savedTheme
    notificationsEnabled = savedNotifications
    
    // Load saved form data
    const savedFormData = auth.loadFormData('contact-form')
    if (savedFormData) {
      formData = { ...savedFormData }
    }
  })
</script>

<div class="svelte-vormia-example">
  <h1>Svelte + VormiaQueryJS + Zustand</h1>
  
  <!-- Authentication Status -->
  <div class="auth-status">
    <h2>Authentication Status</h2>
    <p>Logged in: {auth.isAuthenticated ? 'Yes' : 'No'}</p>
    {#if $auth.user}
      <p>User: {$auth.user.name} ({$auth.user.email})</p>
    {/if}
    <p>Roles: {$auth.roles.join(', ') || 'None'}</p>
    <p>Permissions: {$auth.permissions.join(', ') || 'None'}</p>
  </div>

  <!-- Login Form -->
  {#if !$auth.isAuthenticated}
    <div class="login-form">
      <h2>Login</h2>
      <form on:submit|preventDefault={handleLogin}>
        <div>
          <label>Email:</label>
          <input bind:value={loginForm.email} type="email" required />
        </div>
        <div>
          <label>Password:</label>
          <input bind:value={loginForm.password} type="password" required />
        </div>
        <div>
          <label>
            <input bind:checked={loginForm.rememberMe} type="checkbox" />
            Remember Me
          </label>
        </div>
        <button type="submit" disabled={$auth.isLoading}>
          {$auth.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  {/if}

  <!-- Logout Button -->
  {#if $auth.isAuthenticated}
    <div class="logout-section">
      <button on:click={handleLogout}>Logout</button>
    </div>
  {/if}

  <!-- Route Protection Examples -->
  <div class="route-examples">
    <h2>Route Protection Examples</h2>
    
    <!-- Admin Only Content -->
    <VormiaRouteGuard 
      roles={['admin']} 
      on:authorized={handleAuthorized}
      on:unauthorized={handleUnauthorized}
    >
      <div class="admin-content">
        <h3>Admin Dashboard</h3>
        <p>This content is only visible to admins.</p>
        <button on:click={adminAction}>Admin Action</button>
      </div>
    </VormiaRouteGuard>

    <!-- Moderator or Admin Content -->
    <VormiaRouteGuard 
      roles={['admin', 'moderator']} 
      requireAll={false}
      on:authorized={handleAuthorized}
      on:unauthorized={handleUnauthorized}
    >
      <div class="moderator-content">
        <h3>Moderator Panel</h3>
        <p>This content is visible to moderators and admins.</p>
        <button on:click={moderatorAction}>Moderator Action</button>
      </div>
    </VormiaRouteGuard>

    <!-- Permission-based Content -->
    <VormiaRouteGuard 
      permissions={['manage_users']}
      on:authorized={handleAuthorized}
      on:unauthorized={handleUnauthorized}
    >
      <div class="permission-content">
        <h3>User Management</h3>
        <p>This content requires 'manage_users' permission.</p>
        <button on:click={userManagementAction}>Manage Users</button>
      </div>
    </VormiaRouteGuard>

    <!-- Custom Validation -->
    <VormiaRouteGuard 
      validate={validatePremiumUser}
      on:authorized={handleAuthorized}
      on:unauthorized={handleUnauthorized}
    >
      <div class="premium-content">
        <h3>Premium Features</h3>
        <p>This content is only for premium users.</p>
        <button on:click={premiumAction}>Premium Action</button>
      </div>
    </VormiaRouteGuard>
  </div>

  <!-- User Preferences -->
  {#if $auth.isAuthenticated}
    <div class="user-preferences">
      <h2>User Preferences</h2>
      <div>
        <label>Theme:</label>
        <select bind:value={selectedTheme} on:change={updateTheme}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      <div>
        <label>Notifications:</label>
        <input 
          bind:checked={notificationsEnabled} 
          type="checkbox" 
          on:change={updateNotifications}
        />
      </div>
    </div>
  {/if}

  <!-- Form Data Persistence -->
  <div class="form-persistence">
    <h2>Form Data Persistence</h2>
    <form on:submit|preventDefault={saveFormData}>
      <div>
        <label>Name:</label>
        <input bind:value={formData.name} type="text" />
      </div>
      <div>
        <label>Email:</label>
        <input bind:value={formData.email} type="email" />
      </div>
      <div>
        <label>Message:</label>
        <textarea bind:value={formData.message}></textarea>
      </div>
      <button type="submit">Save Form Data</button>
      <button type="button" on:click={loadFormData}>Load Form Data</button>
      <button type="button" on:click={clearFormData}>Clear Form Data</button>
    </form>
  </div>

  <!-- Cache Management -->
  <div class="cache-management">
    <h2>Cache Management</h2>
    <button on:click={clearCache}>Clear Cache</button>
    <button on:click={getCacheStats}>Get Cache Stats</button>
    {#if cacheStats}
      <div>
        <p>Cache Items: {cacheStats.itemCount}</p>
        <p>Cache Size: {cacheStats.totalSize} bytes</p>
        <p>Hit Rate: {cacheStats.hitRate}%</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .svelte-vormia-example {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: Arial, sans-serif;
  }

  .auth-status, .login-form, .route-examples, .user-preferences, .form-persistence, .cache-management {
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  h1, h2, h3 {
    color: #333;
  }

  form div {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input, select, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  button {
    background-color: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.5rem;
  }

  button:hover {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }

  .admin-content, .moderator-content, .permission-content, .premium-content {
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
  }

  .admin-content {
    background-color: #d4edda;
    border: 1px solid #c3e6cb;
  }

  .moderator-content {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
  }

  .permission-content {
    background-color: #d1ecf1;
    border: 1px solid #bee5eb;
  }

  .premium-content {
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
  }
</style>

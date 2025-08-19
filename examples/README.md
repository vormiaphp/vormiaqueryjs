# VormiaQueryJS Examples

This folder contains examples of how to use VormiaQueryJS in different frameworks and environments.

## 📁 Available Examples

### 🚀 **enhanced-usage.js** - Comprehensive React Example
- **Purpose**: Complete demonstration of all VormiaQueryJS features
- **Features**: 
  - All hook types (`useVormiaQuery`, `useVormiaQueryAuth`, `useVormiaQueryAuthMutation`, `useVormiaQuerySimple`)
  - Form data transformation (automatic and manual)
  - Notification system (`SimpleNotification`, `NotificationPanel`)
  - Debug panel integration
  - Error handling patterns
- **Best for**: Learning the complete API and seeing all features in action

### ⚛️ **React** - `App.jsx`
- **Purpose**: Real-world React implementation
- **Features**:
  - User registration form with automatic form transformation
  - Field error handling with `SimpleNotification`
  - Success/error notifications with `NotificationPanel`
  - Debug panel integration
  - Modern Tailwind CSS styling
- **Best for**: React developers building production applications

### 💚 **Vue** - `App.vue`
- **Purpose**: Vue.js implementation
- **Features**:
  - Vue 3 Composition API
  - Form handling with v-model
  - Custom notification system
  - Field error display
  - Tailwind CSS styling
- **Best for**: Vue developers integrating VormiaQueryJS

### 🟦 **Svelte** - `App.svelte`
- **Purpose**: Svelte implementation
- **Features**:
  - Svelte 5 syntax
  - Reactive state management
  - Form handling with bind:value
  - Custom notification system
  - Tailwind CSS styling
- **Best for**: Svelte developers integrating VormiaQueryJS

### 🟨 **Vanilla JavaScript** - `App.js`
- **Purpose**: Framework-agnostic implementation
- **Features**:
  - ES6+ class-based architecture
  - DOM manipulation
  - Event handling
  - Custom notification system
  - Tailwind CSS styling
- **Best for**: Developers using vanilla JS or integrating with other frameworks

## 🎯 **How to Use These Examples**

### 1. **Choose Your Framework**
- Pick the example that matches your development environment
- All examples demonstrate the same core concepts

### 2. **Install Dependencies**
```bash
npm install vormiaqueryjs
```

### 3. **Set Up Environment Variables**
Create a `.env` file:
```env
VITE_VORMIA_API_URL=https://api.example.com
VITE_VORMIA_DEBUG=true
VITE_VORMIA_AUTH_TOKEN_KEY=vormia_auth_token
VITE_VORMIA_TIMEOUT=30000
VITE_VORMIA_WITH_CREDENTIALS=false
```

### 4. **Copy and Customize**
- Copy the relevant example file
- Modify the API endpoints for your backend
- Adjust the form fields for your use case
- Customize styling to match your design system

## 🔑 **Key Concepts Demonstrated**

### **Form Data Transformation**
```javascript
// Automatic transformation
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  formdata: {
    rename: { confirmPassword: "password_confirmation" },
    add: { terms: true, source: "web" },
    remove: ["confirmPassword"]
  }
});

// Manual transformation
const mutation = useVormiaQueryAuthMutation({
  endpoint: "/register",
  manualTransformation: true
});
```

### **Notification System**
```javascript
// Simple notifications
<SimpleNotification
  type="error"
  message="Field error message"
  onClose={() => clearError()}
/>

// Advanced notifications
<NotificationPanel
  notification={{
    type: "success",
    title: "Success",
    message: "Operation completed!",
    variant: "banner"
  }}
  onClose={() => setNotification(null)}
/>
```

### **Error Handling**
```javascript
onError: (error) => {
  // Handle field errors
  if (error.response?.errors) {
    setFieldErrors(error.response.errors);
  } else {
    setGeneralError(error.message);
  }
}
```

## 🚀 **Getting Started**

1. **Start with `enhanced-usage.js`** to understand all features
2. **Choose your framework example** for implementation details
3. **Customize for your API** and requirements
4. **Add your styling** and branding

## 📚 **Additional Resources**

- **Main README**: See the root `README.md` for complete documentation
- **API Reference**: Check the source code for detailed hook options
- **Environment Variables**: See `.env.example` for configuration options

## 🤝 **Contributing**

Found a bug or want to improve an example? 
- Update the example code
- Test in the target framework
- Ensure it follows current package workflow
- Submit a pull request

---

**Note**: All examples are kept up-to-date with the current VormiaQueryJS package. They demonstrate the actual exported components and hooks, not deprecated features.

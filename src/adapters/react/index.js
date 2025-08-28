// React adapter for VormiaQueryJS
export { useVormiaQuery } from './useVormiaQuery.js';

// React-specific hooks
export { useVormiaConfig } from '../../hooks/useVormiaConfig.js';
export { useVrmAuthEnhanced } from '../../hooks/useVrmAuthEnhanced.js';
export { useVormiaCache } from '../../hooks/useVormiaCache.js';
export { useVrmQuery } from '../../hooks/useVrmQuery.js';
export { useVormiaQuerySimple } from '../../hooks/useVormiaQuerySimple.js';
export { 
  useVormiaQueryAuth, 
  useVormiaQueryAuthMutation, 
  useVormiaAuth 
} from '../../hooks/useVrmAuth.js';
export { useVrmMutation } from '../../hooks/useVrmMutation.js';

// React components
export { VormiaProvider } from '../../providers/VormiaProvider.jsx';
export { default as ErrorDebugPanel } from '../../components/ErrorDebugPanel.jsx';
export { default as NotificationPanel } from '../../components/NotificationPanel.jsx';
export { default as VormiaRouteGuard } from '../../components/VormiaRouteGuard.jsx';

// Zustand stores (framework-agnostic but commonly used with React)
export * from '../../stores/index.js';

// Utilities
export * from '../../utils/formDataTransformer.js';
export * from '../../utils/enhancedErrorHandler.js';

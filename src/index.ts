// Main entry point
export { VormiaQueryProvider } from './providers/VormiaQueryProvider';
export { useVrmQuery } from './hooks/useVrmQuery';
export { useVrmAuth } from './hooks/useVrmAuth';
export { useVrmMutation } from './hooks/useVrmMutation';
export { createVormiaClient } from './client/createVormiaClient';

// Types
export type { VormiaError } from './client/utils/VormiaError';
export type {
  VormiaConfig,
  VormiaQueryOptions,
  VormiaAuthOptions,
  VormiaMutationOptions,
  VormiaResponse,
  VormiaAuthResponse,
  HttpMethod,
} from './types';

// VormiaError is now exported from the types section above
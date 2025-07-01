// Mock global objects for testing
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock fetch
const fetchMock = vi.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ data: {} }),
  })
);

// Set up global mocks
global.localStorage = localStorageMock;
global.fetch = fetchMock;

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ 
    data: null, 
    isLoading: false, 
    isError: false,
    error: null,
    refetch: vi.fn() 
  }),
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: null,
  }),
  useQueryClient: vi.fn().mockReturnValue({
    invalidateQueries: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
    removeQueries: vi.fn(),
  }),
}));

// Mock other dependencies
vi.mock('axios', () => ({
  create: vi.fn(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  })),
}));

// Mock crypto-js
vi.mock('crypto-js', () => ({
  AES: {
    encrypt: vi.fn().mockReturnValue('encrypted-data'),
    decrypt: vi.fn().mockReturnValue({
      toString: () => JSON.stringify({ test: 'data' })
    })
  },
  enc: {
    Utf8: 'utf8'
  },
  lib: {
    WordArray: {
      random: vi.fn().mockReturnValue('random-key')
    }
  },
  SHA256: vi.fn().mockReturnValue('hashed-data')
}));

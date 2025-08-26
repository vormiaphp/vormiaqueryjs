// Test setup file for Vitest
import "@testing-library/jest-dom";

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.history for navigation tests
Object.defineProperty(window, "history", {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
  writable: true,
});

// Mock PopStateEvent
global.PopStateEvent = class PopStateEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
  }
};

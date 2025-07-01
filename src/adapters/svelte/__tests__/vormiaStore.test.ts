import { get } from 'svelte/store';
import { createVormiaStore, createVormiaMutation } from '../vormiaStore';
import { VormiaError } from '../../../core/VormiaClient';

// Mock the global Vormia client
const mockClient = {
  request: jest.fn(),
};

jest.mock('../../../core/VormiaClient', () => ({
  ...jest.requireActual('../../../core/VormiaClient'),
  getGlobalVormiaClient: () => mockClient,
  VormiaError: class MockVormiaError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.status = status;
      this.name = 'VormiaError';
    }
  },
}));

describe('createVormiaStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a store with initial state', () => {
    const store = createVormiaStore({
      endpoint: '/test',
      autoFetch: false,
    });

    expect(get(store)).toBeNull();
    expect(get(store.loading)).toBe(false);
    expect(get(store.error)).toBeNull();
    expect(get(store.response)).toBeNull();
  });

  it('should fetch data when autoFetch is true', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockClient.request.mockResolvedValueOnce({
      data: { response: mockData, status: 'success' },
    });

    const store = createVormiaStore({
      endpoint: '/test',
      autoFetch: true,
    });

    // Should be loading initially
    expect(get(store.loading)).toBe(true);

    // Wait for the request to complete
    await new Promise(process.nextTick);

    expect(mockClient.request).toHaveBeenCalledWith({
      url: '/test',
      method: 'GET',
    });

    expect(get(store)).toEqual(mockData);
    expect(get(store.loading)).toBe(false);
    expect(get(store.error)).toBeNull();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch');
    mockClient.request.mockRejectedValueOnce(error);

    const store = createVormiaStore({
      endpoint: '/test',
      autoFetch: true,
    });

    await new Promise(process.nextTick);

    expect(get(store.error)).toBeInstanceOf(Error);
    expect(get(store.error)?.message).toBe('Failed to fetch');
    expect(get(store.loading)).toBe(false);
  });

  it('should support manual refresh', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockClient.request
      .mockResolvedValueOnce({
        data: { response: { ...mockData, name: 'First' }, status: 'success' },
      })
      .mockResolvedValueOnce({
        data: { response: { ...mockData, name: 'Second' }, status: 'success' },
      });

    const store = createVormiaStore({
      endpoint: '/test',
      autoFetch: true,
    });

    await new Promise(process.nextTick);
    expect(get(store)?.name).toBe('First');

    await store.refresh();
    expect(get(store)?.name).toBe('Second');
  });

  it('should support request cancellation', async () => {
    const store = createVormiaStore({
      endpoint: '/test',
      autoFetch: true,
    });

    // Cancel the request before it completes
    store.cancel();

    await new Promise(process.nextTick);
    expect(get(store.error)).toBeInstanceOf(VormiaError);
    expect(get(store.error)?.message).toBe('Request was cancelled');
  });
});

describe('createVormiaMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a mutation store with initial state', () => {
    const mutation = createVormiaMutation();

    expect(get(mutation.data)).toBeNull();
    expect(get(mutation.loading)).toBe(false);
    expect(get(mutation.error)).toBeNull();
  });

  it('should execute a mutation', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockClient.request.mockResolvedValueOnce({
      data: { response: mockData, status: 'success' },
    });

    const mutation = createVormiaMutation();
    const result = await mutation.mutate('/test', { name: 'Test' });

    expect(mockClient.request).toHaveBeenCalledWith({
      url: '/test',
      method: 'POST',
      data: { name: 'Test' },
    });

    expect(result.response).toEqual(mockData);
    expect(get(mutation.data)?.response).toEqual(mockData);
    expect(get(mutation.loading)).toBe(false);
    expect(get(mutation.error)).toBeNull();
  });

  it('should handle mutation errors', async () => {
    const error = new Error('Mutation failed');
    mockClient.request.mockRejectedValueOnce(error);

    const mutation = createVormiaMutation();
    
    await expect(mutation.mutate('/test', {})).rejects.toThrow('Mutation failed');
    
    expect(get(mutation.error)?.message).toBe('Mutation failed');
    expect(get(mutation.loading)).toBe(false);
  });

  it('should support custom HTTP methods', async () => {
    mockClient.request.mockResolvedValueOnce({
      data: { response: { success: true }, status: 'success' },
    });

    const mutation = createVormiaMutation();
    await mutation.mutate('/test/1', { name: 'Updated' }, 'PUT');

    expect(mockClient.request).toHaveBeenCalledWith({
      url: '/test/1',
      method: 'PUT',
      data: { name: 'Updated' },
    });
  });

  it('should support request cancellation', async () => {
    const mutation = createVormiaMutation();
    
    // Start the mutation
    const promise = mutation.mutate('/test', { name: 'Test' });
    
    // Cancel before it completes
    mutation.cancel();
    
    await expect(promise).rejects.toThrow('Request was cancelled');
    expect(get(mutation.error)?.message).toBe('Request was cancelled');
  });
});

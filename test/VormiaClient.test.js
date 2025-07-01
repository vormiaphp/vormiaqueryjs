import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VormiaClient } from '../src/client/createVormiaClient.js';

describe('VormiaClient', () => {
  let client;
  const mockResponse = { data: { id: 1, name: 'Test' } };

  beforeEach(() => {
    // Create a new client instance before each test
    client = new VormiaClient({
      baseURL: 'https://api.example.com',
    });
    
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock the fetch implementation
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      })
    );
  });

  it('should make a GET request', async () => {
    const response = await client.get('/test');
    expect(response.data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
    );
  });

  it('should make a POST request with data', async () => {
    const postData = { name: 'New Item' };
    const response = await client.post('/items', postData);
    
    expect(response.data).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData),
      })
    );
  });

  it('should handle authentication', async () => {
    const token = 'test-token';
    client.setAuthToken(token);
    
    await client.get('/protected');
    
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${token}`,
        }),
      })
    );
  });

  it('should handle errors', async () => {
    const errorMessage = 'Not Found';
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: errorMessage }),
      })
    );

    await expect(client.get('/not-found')).rejects.toThrow(errorMessage);
  });

  it('should handle network errors', async () => {
    const errorMessage = 'Network error';
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error(errorMessage))
    );

    await expect(client.get('/error')).rejects.toThrow(errorMessage);
  });
});

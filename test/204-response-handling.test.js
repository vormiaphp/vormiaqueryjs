import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createVormiaClient } from '../src/client/createVormiaClient.js'
import { VormiaError } from '../src/client/utils/VormiaError.js'

// Mock fetch globally
global.fetch = vi.fn()

describe('204 Response Handling', () => {
  let client

  beforeEach(() => {
    vi.clearAllMocks()
    client = createVormiaClient({
      baseURL: 'https://api.example.com'
    })
  })

  it('should handle 204 No Content responses correctly', async () => {
    // Mock a 204 response
    const mockResponse = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new Error('No content to parse'))
    }

    global.fetch.mockResolvedValue(mockResponse)

    const result = await client.post('/api/logout')

    expect(result.status).toBe(204)
    expect(result.data).toEqual({
      message: 'Success - No content returned'
    })
    expect(result.statusText).toBe('No Content')
  })

  it('should handle 205 Reset Content responses correctly', async () => {
    // Mock a 205 response
    const mockResponse = {
      ok: true,
      status: 205,
      statusText: 'Reset Content',
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new Error('No content to parse'))
    }

    global.fetch.mockResolvedValue(mockResponse)

    const result = await client.post('/api/reset')

    expect(result.status).toBe(205)
    expect(result.data).toEqual({
      message: 'Success - No content returned'
    })
    expect(result.statusText).toBe('Reset Content')
  })

  it('should handle 204 responses in DELETE requests', async () => {
    // Mock a 204 response for DELETE
    const mockResponse = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new Error('No content to parse'))
    }

    global.fetch.mockResolvedValue(mockResponse)

    const result = await client.delete('/api/resource/123')

    expect(result.status).toBe(204)
    expect(result.data).toEqual({
      message: 'Success - No content returned'
    })
  })

  it('should handle 204 responses in PUT requests', async () => {
    // Mock a 204 response for PUT
    const mockResponse = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new Error('No content to parse'))
    }

    global.fetch.mockResolvedValue(mockResponse)

    const result = await client.put('/api/resource/123', { name: 'Updated' })

    expect(result.status).toBe(204)
    expect(result.data).toEqual({
      message: 'Success - No content returned'
    })
  })

  it('should handle 204 responses in PATCH requests', async () => {
    // Mock a 204 response for PATCH
    const mockResponse = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new Error('No content to parse'))
    }

    global.fetch.mockResolvedValue(mockResponse)

    const result = await client.patch('/api/resource/123', { name: 'Patched' })

    expect(result.status).toBe(204)
    expect(result.data).toEqual({
      message: 'Success - No content returned'
    })
  })

  it('should still handle 200 responses with JSON content normally', async () => {
    // Mock a normal 200 response
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({ message: 'Success', data: { id: 1 } })
    }

    global.fetch.mockResolvedValue(mockResponse)

    const result = await client.get('/api/resource/1')

    expect(result.status).toBe(200)
    expect(result.data).toEqual({
      message: 'Success',
      data: { id: 1 }
    })
  })

  it('should handle 204 responses in error scenarios', async () => {
    // Mock a 204 response that's not ok (shouldn't happen in real world, but testing edge case)
    const mockResponse = {
      ok: false,
      status: 204,
      statusText: 'No Content',
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new Error('No content to parse'))
    }

    global.fetch.mockResolvedValue(mockResponse)

    try {
      await client.post('/api/error-endpoint')
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error).toBeInstanceOf(VormiaError)
      expect(error.status).toBe(204)
      expect(error.message).toBe('Success - No content returned')
    }
  })

  it('should handle malformed JSON responses gracefully', async () => {
    // Mock a response with invalid JSON
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON'))
    }

    global.fetch.mockResolvedValue(mockResponse)

    const result = await client.get('/api/malformed-json')

    expect(result.status).toBe(200)
    expect(result.data.message).toContain('Response received but could not parse content')
    expect(result.data.status).toBe(200)
  })
})

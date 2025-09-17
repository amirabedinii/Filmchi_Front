import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Default MSW server with no handlers; tests can override with server.use
export const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Polyfill scrollIntoView for jsdom
Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: () => {},
  writable: true,
});

// Export msw utilities for tests convenience
export { http, HttpResponse }



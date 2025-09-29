// Re-export all API services
export * from './auth';
export * from './movies';
export * from './lists';
export * from './recommendations';
export * from './users';
export * from './health';

// Export the configured axios instance
export { default as api } from './api';

// Export types
export * from '../types/api';

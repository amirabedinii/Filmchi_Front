import api from './api';

export type HealthResponse = {
  status: 'ok' | 'error';
  message?: string;
  timestamp: string;
  version?: string;
  uptime?: number;
};

// Check API health status
export async function checkHealth() {
  const { data } = await api.get('/');
  return data as HealthResponse;
}

// Test API connectivity
export async function testConnection() {
  try {
    const response = await checkHealth();
    return {
      connected: true,
      status: response.status,
      message: response.message,
    };
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

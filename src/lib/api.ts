// Centralized API client for backend communication

const API_BASE = import.meta.env.VITE_API_BASE || '';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new APIError(408, 'Request timeout');
    }
    throw error;
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new APIError(response.status, error.error || error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, 'Network error');
  }
}

// API methods
export const api = {
  // Health check
  health: () => apiRequest<{ status: string; users: number }>('/api/health'),

  // Species
  getSpecies: () => apiRequest<any[]>('/api/species'),
  addSpecies: (data: any) =>
    apiRequest<any>('/api/species', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tasks
  getTasks: () => apiRequest<any[]>('/api/tasks'),
  addTask: (data: any) =>
    apiRequest<any>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTask: (id: string, data: any) =>
    apiRequest<any>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Mesh data
  getMeshData: () => apiRequest<any[]>('/api/mesh-data'),
  getPredictions: () => apiRequest<any[]>('/api/predictions'),

  // Simulation
  getSimulationStatus: () => apiRequest<any>('/api/simulation/status'),
  controlSimulation: (action: string, scenario?: string, parameters?: any) =>
    apiRequest<any>('/api/simulation/control', {
      method: 'POST',
      body: JSON.stringify({ action, scenario, parameters }),
    }),

  // User profile
  getProfile: (uid: string) => apiRequest<any>(`/api/user/profile/${uid}`),
  updateProfile: (uid: string, data: any) =>
    apiRequest<any>(`/api/user/profile/${uid}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // API Keys
  getKeys: (uid: string) => apiRequest<any[]>(`/api/keys/${uid}`),
  createKey: (uid: string, name: string) =>
    apiRequest<any>(`/api/keys/${uid}`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  deleteKey: (uid: string, keyId: string) =>
    apiRequest<any>(`/api/keys/${uid}/${keyId}`, {
      method: 'DELETE',
    }),

  // Feedback
  submitFeedback: (data: any) =>
    apiRequest<any>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Notifications
  sendNotification: (data: any) =>
    apiRequest<any>('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  sendEmail: (email: string, subject: string, body: string) =>
    apiRequest<any>('/api/notifications/email', {
      method: 'POST',
      body: JSON.stringify({ email, subject, body }),
    }),

  // Payments
  createStripeSession: (planId: string, planName: string, amount: number) =>
    apiRequest<{ id: string; url: string }>('/api/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ planId, planName, amount }),
    }),
  capturePayPalOrder: (orderID: string) =>
    apiRequest<any>('/api/paypal/capture', {
      method: 'POST',
      body: JSON.stringify({ orderID }),
    }),

  // GitHub
  getGitHubAuthUrl: () => apiRequest<{ url: string }>('/api/auth/github/url'),
  getGitHubStatus: () => apiRequest<{ connected: boolean }>('/api/auth/github/status'),
  getGitHubUser: () => apiRequest<any>('/api/github/user'),
  logoutGitHub: () =>
    apiRequest<any>('/api/auth/github/logout', {
      method: 'POST',
    }),
  pushToGitHub: (repoName: string, fileName: string, content: string, message: string) =>
    apiRequest<any>('/api/github/push', {
      method: 'POST',
      body: JSON.stringify({ repoName, fileName, content, message }),
    }),
};

export { APIError };

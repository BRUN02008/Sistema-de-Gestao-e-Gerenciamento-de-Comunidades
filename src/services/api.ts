const API_URL = 'http://127.0.0.1:8000/api';

async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('sisgest_access');

  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('sisgest_access');
    localStorage.removeItem('sisgest_refresh');
    localStorage.removeItem('sisgest_user');
  }

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.error ||
      'Erro ao comunicar com o servidor.'
    );
  }

  return data;
}

export const api = {
  get: (endpoint: string) =>
    apiFetch(endpoint),

  post: (endpoint: string, body: unknown) =>
    apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (endpoint: string, body: unknown) =>
    apiFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: (endpoint: string, body: unknown) =>
    apiFetch(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: (endpoint: string) =>
    apiFetch(endpoint, {
      method: 'DELETE',
    }),
};
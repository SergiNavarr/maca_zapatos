const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    'Falta la variable de entorno NEXT_PUBLIC_API_URL. ' +
      'Definila en .env.local (ver .env.example). ' +
      'No hay fallback a producción a propósito.'
  );
}

export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options?.headers);
  
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || errorData?.mensaje || `Error HTTP: ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en la llamada a ${endpoint}:`, error);
    throw error;
  }
};
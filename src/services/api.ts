import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8d787f3b`;

// Helper para fazer requisições
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Adicionar token se disponível e não for explicitamente desabilitado
  if (token && !options.headers?.['skip-auth']) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (!token) {
    headers['Authorization'] = `Bearer ${publicAnonKey}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ================================================
// AUTH API
// ================================================

export const authAPI = {
  signup: async (data: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    birthDate: string;
    password: string;
  }) => {
    const result = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  },

  login: async (email: string, password: string) => {
    const result = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Salvar token
    if (result.session?.access_token) {
      localStorage.setItem('access_token', result.session.access_token);
      localStorage.setItem('refresh_token', result.session.refresh_token);
    }
    
    return result;
  },

  logout: async () => {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  getCurrentUser: async () => {
    return fetchAPI('/auth/me');
  },

  updateProfile: async (data: {
    name?: string;
    phone?: string;
    birthDate?: string;
  }) => {
    return fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  forgotPassword: async (email: string) => {
    return fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// ================================================
// EVENTS API
// ================================================

export const eventsAPI = {
  getAll: async () => {
    return fetchAPI('/events');
  },

  getById: async (id: string) => {
    return fetchAPI(`/events/${id}`);
  },

  create: async (eventData: {
    title: string;
    description: string;
    image: string;
    date: string;
    time: string;
    spaceId: string;
    spaceName: string;
    price: number;
    totalSeats: number;
    category: string;
    duration: string;
  }) => {
    return fetchAPI('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },
};

// ================================================
// BOOKINGS API
// ================================================

export const bookingsAPI = {
  getAll: async () => {
    return fetchAPI('/bookings');
  },

  create: async (data: {
    eventId: string;
    seats: string[];
    totalPrice: number;
  }) => {
    return fetchAPI('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  cancel: async (bookingId: string) => {
    return fetchAPI(`/bookings/${bookingId}/cancel`, {
      method: 'PUT',
    });
  },
};

// ================================================
// SPACES API
// ================================================

export const spacesAPI = {
  getAll: async () => {
    return fetchAPI('/spaces');
  },
};

// ================================================
// SPACE RENTALS API
// ================================================

export const spaceRentalsAPI = {
  getAll: async () => {
    return fetchAPI('/space-rentals');
  },

  create: async (data: {
    spaceId: string;
    date: string;
    startTime: string;
    endTime: string;
    eventType: string;
    description: string;
    totalCost: number;
  }) => {
    return fetchAPI('/space-rentals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (rentalId: string, status: 'approved' | 'rejected') => {
    return fetchAPI(`/space-rentals/${rentalId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ================================================
// FAVORITES API
// ================================================

export const favoritesAPI = {
  getAll: async () => {
    return fetchAPI('/favorites');
  },

  add: async (eventId: string) => {
    return fetchAPI('/favorites', {
      method: 'POST',
      body: JSON.stringify({ eventId }),
    });
  },

  remove: async (eventId: string) => {
    return fetchAPI(`/favorites/${eventId}`, {
      method: 'DELETE',
    });
  },
};

// ================================================
// NOTIFICATIONS API
// ================================================

export const notificationsAPI = {
  getAll: async () => {
    return fetchAPI('/notifications');
  },

  markAsRead: async (notificationId: string) => {
    return fetchAPI(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return fetchAPI('/notifications/read-all', {
      method: 'PUT',
    });
  },
};

// ================================================
// ADMIN API
// ================================================

export const adminAPI = {
  getMetrics: async () => {
    return fetchAPI('/admin/metrics');
  },
};

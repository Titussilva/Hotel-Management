import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  throw new Error("Missing VITE_API_URL");
}
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem('stayease-session') || 'null');
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }
  } catch (_) { }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
   if (error.response?.status === 401) {
  localStorage.removeItem('stayease-session');

  if (window.location.pathname !== "/login") {
    window.history.pushState({}, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
}
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    return Promise.reject(new Error(message));
  },
);

export const authAPI = {
  login:    (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  me:       ()     => api.get('/auth/me').then((r) => r.data),
  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data),
  toggleFavorite: (roomId) => api.patch(`/auth/favorites/${roomId}`).then((r) => r.data),
};

export const roomsAPI = {
  list:         (params) => api.get('/rooms', { params }).then((r) => r.data),
  get:          (id)     => api.get(`/rooms/${id}`).then((r) => r.data),
  availability: (id, params) => api.get(`/rooms/${id}/availability`, { params }).then((r) => r.data),
};

export const bookingsAPI = {
  list:   (params) => api.get('/bookings', { params }).then((r) => r.data),
  get:    (id)     => api.get(`/bookings/${id}`).then((r) => r.data),
  create: (data)   => api.post('/bookings', data).then((r) => r.data),
  cancel: (id)     => api.patch(`/bookings/${id}/cancel`).then((r) => r.data),
};

export const paymentsAPI = {
  createOrder: (data)   => api.post('/payments/create-order', data).then((r) => r.data),
  verify:      (data)   => api.post('/payments/verify', data).then((r) => r.data),
};

export const offersAPI = {
  list:     ()     => api.get('/offers').then((r) => r.data),
  validate: (code) => api.post('/offers/validate', { code }).then((r) => r.data),
};

export const reviewsAPI = {
  create: (data) => api.post('/reviews', data).then((r) => r.data),
};

export const notificationsAPI = {
  list:   ()   => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
};

export const adminAPI = {
  createRoom:  (data) => api.post('/admin/rooms', data).then((r) => r.data),
  updateRoom:  (id, data) => api.put(`/admin/rooms/${id}`, data).then((r) => r.data),
  deleteRoom:  (id)   => api.delete(`/admin/rooms/${id}`).then((r) => r.data),

  listBookings:  (params) => api.get('/admin/bookings', { params }).then((r) => r.data),
  updateBooking: (id, data) => api.patch(`/admin/bookings/${id}`, data).then((r) => r.data),

  listReviews:   (params) => api.get('/admin/reviews', { params }).then((r) => r.data),
  updateReview:  (id, data) => api.patch(`/admin/reviews/${id}`, data).then((r) => r.data),

  listOffers:   () => api.get('/offers').then((r) => r.data),
  createOffer:  (data) => api.post('/admin/offers', data).then((r) => r.data),
  updateOffer:  (id, data) => api.put(`/admin/offers/${id}`, data).then((r) => r.data),
  deleteOffer:  (id) => api.delete(`/admin/offers/${id}`).then((r) => r.data),

  analytics: () => api.get('/admin/analytics').then((r) => r.data),
};

export default api;

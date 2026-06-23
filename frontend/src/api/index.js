import api from './axios';

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.patch(`/users/${id}/deactivate`),
  activate: (id) => api.patch(`/users/${id}/activate`),
  changePassword: (data) => api.patch('/users/me/password', data),
};

// Events
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  create: (data) => api.post('/events', data),
  getById: (id) => api.get(`/events/${id}`),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getDashboard: (id) => api.get(`/events/${id}/dashboard`),
  updateStatus: (id, status) => api.patch(`/events/${id}/status`, { status }),
  duplicate: (id) => api.post(`/events/${id}/duplicate`),
};

// Venues
export const venuesAPI = {
  getAll: (params) => api.get('/venues', { params }),
  create: (data) => api.post('/venues', data),
  getById: (id) => api.get(`/venues/${id}`),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
  getMyVenues: () => api.get('/venues/my-venues'),
  getOwnerVenues: () => api.get('/venues/my-venues'),
  markUnavailable: (id, date) => api.post(`/venues/${id}/unavailable`, { date }),
  removeUnavailable: (id, date) => api.delete(`/venues/${id}/unavailable`, { data: { date } }),
};

// Bookings
export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  respondToCounter: (id, accept) => api.patch(`/bookings/${id}/respond`, { accept }),
  sendCounter: (id, data) => api.patch(`/bookings/${id}/counter`, data),
};

// Tasks
export const tasksAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => api.patch(`/tasks/${id}/status`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Budget
export const budgetAPI = {
  get: (eventId) => api.get(`/events/${eventId}/budget`),
  create: (eventId, data) => api.post(`/events/${eventId}/budget`, data),
  update: (eventId, id, data) => api.put(`/events/${eventId}/budget/${id}`, data),
  delete: (eventId, id) => api.delete(`/events/${eventId}/budget/${id}`),
  updateTotal: (eventId, data) => api.patch(`/events/${eventId}/budget/total`, data),
};

// Layout
export const layoutAPI = {
  get: (eventId) => api.get(`/events/${eventId}/layout`),
  save: (eventId, data) => api.put(`/events/${eventId}/layout`, data),
  share: (eventId) => api.patch(`/events/${eventId}/layout/share`),
};

// Vendors
export const vendorsAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getProfile: () => api.get('/vendors/profile'),
  getMyProfile: () => api.get('/vendors/profile'),
  getById: (id) => api.get(`/vendors/${id}`),
  createProfile: (data) => api.post('/vendors/profile', data),
  updateProfile: (data) => api.put('/vendors/profile', data),
  upsertProfile: (data) => api.put('/vendors/profile', data),
  submitRating: (data) => api.post('/vendors/ratings', data),
  getRatings: (vendorId) => api.get(`/vendors/${vendorId}/ratings`),
  duplicate: (id) => api.post(`/events/${id}/duplicate`),
};

// Sourcing
export const sourcingAPI = {
  getAll: (params) => api.get('/sourcing-requests', { params }),
  create: (data) => api.post('/sourcing-requests', data),
  getById: (id) => api.get(`/sourcing-requests/${id}`),
  updateStatus: (id, data) => api.patch(`/sourcing-requests/${id}/status`, data),
  sendMessage: (id, data) => api.post(`/sourcing-requests/${id}/message`, data),
};

// Invoices
export const invoicesAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  create: (data) => api.post('/invoices', data),
  updateStatus: (id, data) => api.patch(`/invoices/${id}/status`, data),
};

// Guests
export const guestsAPI = {
  getAll: (params) => api.get('/guests', { params }),
  create: (data) => api.post('/guests', data),
  update: (id, data) => api.put(`/guests/${id}`, data),
  delete: (id) => api.delete(`/guests/${id}`),
  updateRSVP: (id, data) => api.patch(`/guests/${id}/rsvp`, data),
  checkIn: (id, data) => api.patch(`/guests/${id}/checkin`, data),
  getByQR: (qrCode) => api.get(`/guests/qr/${qrCode}`),
};

// Invitations
export const invitationsAPI = {
  getForEvent: (eventId) => api.get(`/events/${eventId}/invitations`),
  send: (eventId, data) => api.post(`/events/${eventId}/invitations/send`, data),
  getById: (eventId, id) => api.get(`/events/${eventId}/invitations/${id}`),
  getForGuest: () => api.get('/invitations/guest'),
  getGuestInvitations: () => api.get('/invitations/guest'),
};

// Communications
export const commsAPI = {
  getForEvent: (eventId) => api.get(`/events/${eventId}/communications`),
  getEventCommunications: (eventId) => api.get(`/events/${eventId}/communications`),
  send: (eventId, data) => api.post(`/events/${eventId}/communications`, data),
  markSeen: (eventId, id, data) => api.patch(`/events/${eventId}/communications/${id}/seen`, data),
  markAllSeen: (eventId) => api.patch(`/events/${eventId}/communications/seen`),
  followUp: (eventId, data) => api.post(`/events/${eventId}/communications/follow-up-unseen`, data),
};

// Feedback
export const feedbackAPI = {
  getForEvent: (eventId) => api.get(`/events/${eventId}/feedback`),
  submit: (eventId, data) => api.post(`/events/${eventId}/feedback`, data),
};

// Reports
export const reportsAPI = {
  attendance: (eventId) => api.get(`/events/${eventId}/reports/attendance`),
  financial: (eventId) => api.get(`/events/${eventId}/reports/financial`),
  full: (eventId) => api.get(`/events/${eventId}/reports/full`),
  export: (eventId) => api.get(`/events/${eventId}/reports/export`, { responseType: 'blob' }),
  venuePerformance: (eventId) => api.get(`/events/${eventId}/reports/venue-performance`),
  getVenueReport: (venueId) => api.get(`/venues/${venueId}/report`),
};

// Activity Log
export const activityAPI = {
  getMyActivity: (params) => api.get('/activity', { params }),
};

// Notifications
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
};

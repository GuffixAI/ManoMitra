// web/lib/api.ts
import { api } from './axios';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Student,
  Counsellor,
  Volunteer,
  Admin
} from '@/types/auth';

// Helper to consistently extract data from response
const getData = (res: any) => res.data.data;

// Authentication API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data; // Login returns the full response object
  },
  registerStudent: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/student/register', data);
    return response.data;
  },
  registerCounsellor: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/counsellor/register', data);
    return response.data;
  },
  registerVolunteer: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/volunteer/register', data);
    return response.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data; // This endpoint returns the user directly
  },
  changePassword: async (data: any): Promise<void> => {
    await api.post('/auth/change-password', data);
  },
  refresh: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  getSocketToken: async (): Promise<{ success: boolean; socketToken: string; }> => {
    const response = await api.post('/auth/socket-token');
    return response.data;
  }
};

// Student API
export const studentAPI = {
  getProfile: async () => api.get('/students/profile').then(getData),
  updateProfile: async (data: Partial<Student>) => api.put('/students/profile', data).then(res => res.data),
  getDashboard: async () => api.get('/students/dashboard').then(getData),
  getAvailableCounsellors: async (params?: any) => api.get('/students/counsellors', { params }).then(res => res.data),
  getAvailableVolunteers: async (params?: any) => api.get('/students/volunteers', { params }).then(res => res.data),
  connectCounsellor: async (counsellorId: string) => api.post('/students/counsellors/connect', { counsellorId }).then(res => res.data),
  disconnectCounsellor: async (counsellorId: string) => api.delete(`/students/counsellors/${counsellorId}`).then(res => res.data),
  connectVolunteer: async (volunteerId: string) => api.post('/students/volunteers/connect', { volunteerId }).then(res => res.data),
  disconnectVolunteer: async (volunteerId: string) => api.delete(`/students/volunteers/${volunteerId}`).then(res => res.data),
  getConnections: async () => api.get('/students/connections').then(getData),
  updatePreferences: async (preferences: any) => api.put('/students/preferences', preferences).then(res => res.data),
};

// Counsellor API
export const counsellorAPI = {
  getProfile: async () => api.get('/counsellors/profile').then(getData),
  updateProfile: async (data: Partial<Counsellor>) => api.put('/counsellors/profile', data).then(res => res.data),
  getDashboard: async () => api.get('/counsellors/dashboard').then(getData),
  getMyStudents: async (params?: any) => api.get('/counsellors/students', { params }).then(getData),
  addStudent: async (studentId: string) => api.post('/counsellors/students', { studentId }).then(res => res.data),
  removeStudent: async (studentId: string) => api.delete(`/counsellors/students/${studentId}`).then(res => res.data),
  getSchedule: async () => api.get('/counsellors/schedule').then(getData),
  getAvailabilityById: async (counsellorId: string) => api.get(`/counsellors/${counsellorId}/availability`).then(getData),
  updateAvailability: async (availability: any) => api.put('/counsellors/availability', availability).then(res => res.data),
  getMyReports: async (params?: any) => api.get('/counsellors/reports', { params }).then(res => res.data),
  getPerformanceMetrics: async () => api.get('/counsellors/performance').then(res => res.data),
};

// Volunteer API
export const volunteerAPI = {
  getProfile: async () => api.get('/volunteers/profile').then(getData),
  updateProfile: async (data: Partial<Volunteer>) => api.put('/volunteers/profile', data).then(res => res.data),
  getDashboard: async () => api.get('/volunteers/dashboard').then(getData),
  getPerformanceMetrics: async () => api.get('/volunteers/performance').then(res => res.data),
  getModeratedRooms: async () => api.get('/volunteers/rooms').then(getData),
  getMessageHistory: async (params?: any) => api.get('/volunteers/messages', { params }).then(res => res.data),
  updateLastActive: async () => api.post('/volunteers/activity').then(res => res.data),
  completeTraining: async () => api.post('/volunteers/training/complete').then(res => res.data),
  getMyFeedback: async () => api.get('/volunteers/feedback').then(getData),
  getAvailabilityStatus: async () => api.get('/volunteers/availability').then(getData),
  updateAvailabilityStatus: async (status: any) => api.put('/volunteers/availability', status).then(res => res.data),
};

// Admin API
export const adminAPI = {
  getProfile: async () => api.get('/admin/profile').then(getData), // ADDED
  updateProfile: async (data: Partial<Admin>) => api.put('/admin/profile', data).then(res => res.data), // ADDED
  getDashboardStats: async () => api.get('/admin/dashboard/stats').then(getData),
  getAllStudents: async (params?: any) => api.get('/admin/users/students', { params }).then(res => res.data),
  getAllCounsellors: async (params?: any) => api.get('/admin/users/counsellors', { params }).then(getData), // FIX: Consistent data unwrapping
  getAllVolunteers: async (params?: any) => api.get('/admin/users/volunteers', { params }).then(getData),
  getAllReports: async (params?: any) => api.get('/admin/reports', { params }).then(res => res.data),
  assignReport: async (reportId: string, counsellorId: string) => api.patch('/admin/reports/assign', { reportId, counsellorId }).then(res => res.data),
  updateUserStatus: async (userId: string, userModel: string, status: boolean) => api.put('/admin/users/status', { userId, userModel, status }).then(res => res.data),
  getSystemAnalytics: async (params?: any) => api.get('/admin/analytics', { params }).then(res => res.data),
  emergencyAccess: async (userId: string, userModel: string, action: 'enable' | 'disable') => api.post('/admin/emergency-access', { userId, userModel, action }).then(res => res.data),
  getUserById: async (userId: string, userModel: string) => api.get(`/admin/users/${userModel}/${userId}`).then(getData),
  sendSystemNotification: async (notification: any) => api.post('/admin/notifications/system', notification).then(res => res.data),
};

// Booking API
export const bookingAPI = {
  createBooking: async (data: any) => api.post('/bookings/student', data).then(res => res.data),
  getMyBookings: async (params?: any) => api.get('/bookings/student', { params }).then(getData),
  getBookingById: async (id: string) => api.get(`/bookings/student/${id}`).then(getData),
  cancelBooking: async (id: string) => api.delete(`/bookings/student/${id}`).then(res => res.data),
  getCounsellorBookings: async (params?: any) => api.get('/bookings/counsellor', { params }).then(getData),
  confirmBooking: async (id: string) => api.put(`/bookings/counsellor/${id}/confirm`).then(res => res.data),
  rejectBooking: async (id: string) => api.put(`/bookings/counsellor/${id}/reject`).then(res => res.data),
  completeBooking: async (id: string) => api.put(`/bookings/counsellor/${id}/complete`).then(res => res.data),
  getAvailableSlots: async (counsellorId: string, date?: string) => api.get(`/bookings/slots/${counsellorId}`, { params: { date } }).then(res => res.data),
};

// Report API
export const reportAPI = {
  createReport: async (data: any) => api.post('/reports', data).then(res => res.data),
  getMyReports: async (params?: any) => api.get('/reports/my', { params }).then(res => res.data),
  getReportById: async (id: string) => api.get(`/reports/my/${id}`).then(getData),
  updateReport: async (id: string, data: any) => api.put(`/reports/my/${id}`, data).then(res => res.data),
  deleteReport: async (id: string) => api.delete(`/reports/my/${id}`).then(res => res.data),
  getAssignedReports: async (params?: any) => api.get('/reports/assigned', { params }).then(res => res.data),
  getReportDetails: async (id: string) => api.get(`/reports/assigned/${id}`).then(getData),
  updateReportStatus: async (id: string, status: string, notes?: string) => api.patch(`/reports/assigned/${id}/status`, { status, resolutionNotes: notes }).then(res => res.data),
};

// Notification API
export const notificationAPI = {
  getUserNotifications: async (params?: any) => api.get('/notifications', { params }).then(res => res.data),
  getUnreadCount: async (category?: string) => api.get('/notifications/unread', { params: { category } }).then(getData),
  markAsRead: async (id: string) => api.put(`/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: async (category?: string) => api.put('/notifications/read-all', null, { params: { category } }).then(res => res.data),
};
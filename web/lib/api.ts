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
// import { AnalyticsSnapshot } from '@/types/analytics'; // You'll create this type in the frontend later
import { AnalyticsSnapshot, TriggerAnalyticsResponse, FetchAnalyticsResponse, FetchAnalyticsVersionsResponse } from '@/types/analytics';

// Helper to consistently extract data from response
const getData = (res: any) => res.data.data;

// Authentication API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data; 
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
    return response.data;
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
  },
   forgotPassword: async (email: string): Promise<{ success: boolean; message: string; }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string; }> => {
    const response = await api.patch(`/auth/reset-password/${token}`, { password });
    return response.data;
  },
};

// Student API
export const studentAPI = {
  getProfile: async () => api.get('/students/profile').then(getData),
  updateProfile: async (data: Partial<Student>) => api.put('/students/profile', data).then(res => res.data),
  getDashboard: async () => api.get('/students/dashboard').then(getData),
  getAvailableCounsellors: async (params?: any) => api.get('/students/counsellors', { params }).then(res => res.data),
  getAvailableVolunteers: async (params?: any) => api.get('/students/volunteers', { params }).then(res => res.data),
  connectCounsellor: async (counsellorId: string) => api.post('/students/counsellors/connect', { counsellorId }).then(res => res.data),
  connectVolunteer: async (volunteerId: string) => api.post('/students/volunteers/connect', { volunteerId }).then(res => res.data),
  getConnections: async () => api.get('/students/connections').then(getData),
  updatePreferences: async (preferences: any) => api.put('/students/preferences', preferences).then(res => res.data),
  updateLastActive: async () => api.post('/students/activity').then(res => res.data),
  disconnectCounsellor: async (counsellorId: string) => api.delete(`/students/counsellors/${counsellorId}`).then(res => res.data),
  disconnectVolunteer: async (volunteerId: string) => api.delete(`/students/volunteers/${volunteerId}`).then(res => res.data),

  submitCheckin: async (data: { moodScore: number; stressLevel: number; openEndedFeedback?: string }) => api.post('/checkins', data).then(res => res.data),
  getCheckinHistory: async () => api.get('/checkins/history').then(getData),
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
  getConnectedStudents: async (params?: any) => api.get('/volunteers/students', { params }).then(res => res.data),
};

// Admin API
export const adminAPI = {
  getProfile: async () => api.get('/admin/profile').then(getData), // ADDED
  updateProfile: async (data: Partial<Admin>) => api.put('/admin/profile', data).then(res => res.data), // ADDED
  getDashboardStats: async () => api.get('/admin/dashboard/stats').then(getData),
  getAllStudents: async (params?: any) => api.get('/admin/users/students', { params }).then(res => res.data),
  getAllReports: async (params?: any) => api.get('/admin/reports', { params }).then(res => res.data),
  assignReport: async (reportId: string, counsellorId: string) => api.patch('/admin/reports/assign', { reportId, counsellorId }).then(res => res.data),
  getUserById: async (userId: string, userModel: string) => api.get(`/admin/users/${userModel}/${userId}`).then(getData),
  sendSystemNotification: async (notification: any) => api.post('/admin/notifications/system', notification).then(res => res.data),
  updateUserStatus: async (userId: string, userType: string, isActive: boolean) => api.patch('/admin/users/status', { userId, userType, isActive }).then(res => res.data),
  getSystemAnalytics: async (params?: any) => api.get('/admin/analytics', { params }).then(res => res.data),
  emergencyAccess: async (userId: string, userType: string, action: 'suspend' | 'activate') => api.post('/admin/emergency', { userId, userType, action }).then(res => res.data),
  getAllCounsellors: async (params?: any) => api.get('/admin/users/counsellors', { params }).then(getData),
  getAllVolunteers: async (params?: any) => api.get('/admin/users/volunteers', { params }).then(res => res.data),
  createCounsellor: async (data: any) => api.post('/admin/users/counsellors', data).then(res => res.data),







  //   // NEW: Trigger advanced analytics generation
  // triggerAdvancedAnalytics: async (period_start?: string, period_end?: string, filters?: any) => {
  //   return api.post('/admin/analytics/generate', { period_start, period_end, filters }).then(res => res.data);
  // },
  // // NEW: Get the latest advanced analytics snapshot
  // getLatestAdvancedAnalytics: async () => api.get('/admin/analytics/advanced/latest').then(getData),
  // // NEW: Get a specific advanced analytics snapshot by its ID
  // getAdvancedAnalyticsById: async (snapshotId: string) => api.get(`/admin/analytics/advanced/${snapshotId}`).then(getData),
  // // NEW: Get a list of all available snapshot versions
  // getAllAnalyticsVersions: async () => api.get('/admin/analytics/advanced/versions').then(getData),


    // NEW: Trigger advanced analytics generation
  triggerAdvancedAnalytics: async (period_start?: string, period_end?: string, filters?: any): Promise<TriggerAnalyticsResponse> => {
    const response = await api.post('/admin/analytics/generate', { period_start, period_end, filters });
    return response.data;
  },
  // NEW: Get the latest advanced analytics snapshot
  getLatestAdvancedAnalytics: async (): Promise<FetchAnalyticsResponse> => api.get('/admin/analytics/advanced/latest').then(res => res.data),
  // NEW: Get a specific advanced analytics snapshot by its ID
  getAdvancedAnalyticsById: async (snapshotId: string): Promise<FetchAnalyticsResponse> => api.get(`/admin/analytics/advanced/${snapshotId}`).then(res => res.data),
  // NEW: Get a list of all available snapshot versions
  getAllAnalyticsVersions: async (): Promise<FetchAnalyticsVersionsResponse> => api.get('/admin/analytics/advanced/versions').then(res => res.data),
  
};

// Booking API
export const bookingAPI = {
  getBookingById: async (id: string) => api.get(`/bookings/student/${id}`).then(getData),
  createBooking: async (data: any) => api.post('/bookings/student', data).then(res => res.data),
  getMyBookings: async (params?: any) => api.get('/bookings/student', { params }).then(getData),
  cancelBooking: async (id: string) => api.delete(`/bookings/student/${id}`).then(res => res.data),
  getCounsellorBookings: async (params?: any) => api.get('/bookings/counsellor', { params }).then(getData),
  confirmBooking: async (id: string) => api.put(`/bookings/counsellor/${id}/confirm`).then(res => res.data),
  rejectBooking: async (id: string) => api.put(`/bookings/counsellor/${id}/reject`).then(res => res.data),
  completeBooking: async (id: string) => api.put(`/bookings/counsellor/${id}/complete`).then(res => res.data),
  getAvailableSlots: async (counsellorId: string, date?: string) => api.get(`/bookings/slots/${counsellorId}`, { params: { date } }).then(res => res.data),
  getAdminStats: async () => api.get('/bookings/admin/stats').then(getData),

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
  getUrgentReports: async () => api.get('/reports/urgent').then(getData),
  getReportsByStatus: async (status: string) => api.get('/reports/status', { params: { status } }).then(getData),
};

// Notification API
export const notificationAPI = {
  getUserNotifications: async (params?: any) => api.get('/notifications', { params }).then(res => res.data),
  getUnreadCount: async (category?: string) => api.get('/notifications/unread', { params: { category } }).then(getData),
  markAsRead: async (id: string) => api.put(`/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: async (category?: string) => api.put('/notifications/read-all', null, { params: { category } }).then(res => res.data),
  getPreferences: async () => api.get('/notifications/preferences').then(getData),
  updatePreferences: async (data: any) => api.put('/notifications/preferences', data).then(res => res.data),
  archive: async (id: string) => api.put(`/notifications/${id}/archive`).then(res => res.data),
  unarchive: async (id: string) => api.put(`/notifications/${id}/unarchive`).then(res => res.data),
  delete: async (id: string) => api.delete(`/notifications/${id}`).then(res => res.data),
  getAdminUserNotifications: async (userId: string, userModel: string, params?: any) => 
    api.get(`/notifications/admin/user/${userId}/${userModel}`, { params }).then(res => res.data),
  sendSystemNotification: async (data: any) => 
    api.post('/admin/notifications/system', data).then(res => res.data),
  getNotificationStats: async () => 
    api.get('/notifications/admin/stats').then(getData),
  cleanupExpiredNotifications: async () => 
    api.post('/notifications/admin/cleanup').then(res => res.data),
};


export const feedbackAPI = {
  submitFeedback: async (data: { targetType: 'counsellor' | 'volunteer'; targetId: string; rating: number; comment?: string }) => api.post('/feedback', data).then(res => res.data),
  getMyFeedback: async () => api.get('/feedback/my').then(res => res.data.data),
  getFeedbackForTarget: async (targetType: string, targetId: string) => api.get(`/feedback/${targetType}/${targetId}`).then(getData),
  getTopRated: async () => api.get('/feedback/top-rated').then(getData),
  getStats: async () => api.get('/feedback/stats').then(getData), // Admin only
  update: async (id: string, data: { rating?: number; comment?: string }) => api.put(`/feedback/${id}`, data).then(res => res.data),
  delete: async (id: string) => api.delete(`/feedback/${id}`).then(res => res.data),
};


export const roomAPI = {
  getAllRooms: async () => api.get('/rooms').then(getData),
  getRoomByTopic: async (topic: string) => api.get(`/rooms/${topic}`).then(getData),
  getRoomMessages: async (topic: string, params?: any) => api.get(`/rooms/${topic}/messages`, { params }).then(res => res.data),
  addModerator: async (topic: string, volunteerId: string) => api.post('/rooms/moderators', { topic, volunteerId }).then(res => res.data), // Admin
  removeModerator: async (topic: string, volunteerId: string) => api.delete(`/rooms/${topic}/moderators/${volunteerId}`).then(res => res.data), // Admin
  getRoomStats: async (topic: string) => 
    api.get(`/rooms/${topic}/stats`).then(getData),
  getRoomActivity: async (topic: string) => 
    api.get(`/rooms/${topic}/activity`).then(getData),
  createRoom: async (data: { topic: string, description?: string }) => 
    api.post('/rooms', data).then(res => res.data),
  updateRoomDescription: async (topic: string, description: string) => 
    api.put(`/rooms/${topic}/description`, { description }).then(res => res.data),
};


export const conversationAPI = {
  getMyConversations: async () => api.get('/conversations').then(getData),
  getMessagesWithUser: async (userId: string) => api.get(`/conversations/with/${userId}`).then(getData),
};

export const aiReportAPI = {
  createReport: async (conversation_history: string) => 
    api.post('/ai-reports', { conversation_history }).then(res => res.data),
  getMyReports: async () => 
    api.get('/ai-reports/my').then(getData),
  getReportById: async (id: string) => 
    api.get(`/ai-reports/${id}`).then(getData),
};

export const psychoeducationalResourceAPI = {
  createResource: async (data: FormData) => api.post('/resources', data, {
    headers: { 'Content-Type': 'multipart/form-data' } // Important for file uploads
  }).then(res => res.data),
  getAllResources: async (params?: any) => api.get('/resources', { params }).then(res => res.data),
  getResourceById: async (id: string) => api.get(`/resources/${id}`).then(res => res.data),
  updateResource: async (id: string, data: FormData) => api.put(`/resources/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data),
  deleteResource: async (id: string) => api.delete(`/resources/${id}`).then(res => res.data),
  getRecommended: async (topics: string[], language: string = 'en') => api.get('/resources/recommended', { params: { topics: topics.join(','), language } }).then(res => res.data),
};


export const pathwayAPI = {
  generatePathway: async (aiReportId: string) => 
    api.post('/pathways/generate', { aiReportId }).then(res => res.data),
  getMyPathways: async () => 
    api.get('/pathways/my').then(getData),
  markStepComplete: async (pathwayId: string, resourceId: string) => 
    api.patch(`/pathways/${pathwayId}/steps/${resourceId}/complete`).then(res => res.data),
};
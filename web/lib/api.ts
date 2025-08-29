// Comprehensive API service layer
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

// Authentication API
export const authAPI = {
  // Universal login for all user types
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Role-specific registration
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

  // Get current user
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Refresh token
  refresh: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Get socket token
  getSocketToken: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/socket-token');
    return response.data;
  }
};

// Student API
export const studentAPI = {
  getProfile: async (): Promise<Student> => {
    const response = await api.get('/students/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<Student>): Promise<Student> => {
    const response = await api.put('/students/profile', data);
    return response.data.data;
  },

  getDashboard: async () => {
    const response = await api.get('/students/dashboard');
    return response.data.data;
  },

  getAvailableCounsellors: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get('/students/counsellors', { params });
    return response.data.data;
  },

  getAvailableVolunteers: async (params?: { limit?: number; offset?: number }) => {
    const response = await api.get('/students/volunteers', { params });
    return response.data.data;
  },

  connectCounsellor: async (counsellorId: string) => {
    const response = await api.post('/students/counsellors/connect', { counsellorId });
    return response.data;
  },

  disconnectCounsellor: async (counsellorId: string) => {
    const response = await api.delete(`/students/counsellors/${counsellorId}`);
    return response.data;
  },

  connectVolunteer: async (volunteerId: string) => {
    const response = await api.post('/students/volunteers/connect', { volunteerId });
    return response.data;
  },

  disconnectVolunteer: async (volunteerId: string) => {
    const response = await api.delete(`/students/volunteers/${volunteerId}`);
    return response.data;
  },

  getConnections: async () => {
    const response = await api.get('/students/connections');
    return response.data.data;
  },

  updatePreferences: async (preferences: any) => {
    const response = await api.put('/students/preferences', preferences);
    return response.data;
  }
};

// Counsellor API
export const counsellorAPI = {
  getProfile: async (): Promise<Counsellor> => {
    const response = await api.get('/counsellors/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<Counsellor>): Promise<Counsellor> => {
    const response = await api.put('/counsellors/profile', data);
    return response.data.data;
  },

  getDashboard: async () => {
    const response = await api.get('/counsellors/dashboard');
    return response.data.data;
  },

  getMyStudents: async (params?: { limit?: number; offset?: number; search?: string }) => {
    const response = await api.get('/counsellors/students', { params });
    return response.data.data;
  },

  addStudent: async (studentId: string) => {
    const response = await api.post('/counsellors/students', { studentId });
    return response.data;
  },

  removeStudent: async (studentId: string) => {
    const response = await api.delete(`/counsellors/students/${studentId}`);
    return response.data;
  },

  getSchedule: async () => {
    const response = await api.get('/counsellors/schedule');
    return response.data.data;
  },

  updateAvailability: async (availability: any) => {
    const response = await api.put('/counsellors/availability', availability);
    return response.data;
  },

  getMyReports: async (params?: { limit?: number; offset?: number; status?: string }) => {
    const response = await api.get('/counsellors/reports', { params });
    return response.data.data;
  },

  getPerformanceMetrics: async () => {
    const response = await api.get('/counsellors/performance');
    return response.data.data;
  }
};

// Volunteer API
export const volunteerAPI = {
  getProfile: async (): Promise<Volunteer> => {
    const response = await api.get('/volunteers/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<Volunteer>): Promise<Volunteer> => {
    const response = await api.put('/volunteers/profile', data);
    return response.data.data;
  },

  getDashboard: async () => {
    const response = await api.get('/volunteers/dashboard');
    return response.data.data;
  },

  getPerformanceMetrics: async () => {
    const response = await api.get('/volunteers/performance');
    return response.data.data;
  },

  getModeratedRooms: async () => {
    const response = await api.get('/volunteers/rooms');
    return response.data.data;
  },

  getMessageHistory: async (roomId: string, params?: { limit?: number; offset?: number }) => {
    const response = await api.get(`/volunteers/rooms/${roomId}/messages`, { params });
    return response.data.data;
  },

  updateLastActive: async () => {
    const response = await api.post('/volunteers/activity');
    return response.data;
  },

  completeTraining: async () => {
    const response = await api.post('/volunteers/training');
    return response.data;
  },

  getMyFeedback: async () => {
    const response = await api.get('/volunteers/feedback');
    return response.data.data;
  },

  getAvailabilityStatus: async () => {
    const response = await api.get('/volunteers/availability');
    return response.data.data;
  },

  updateAvailabilityStatus: async (status: any) => {
    const response = await api.put('/volunteers/availability', status);
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  getAllStudents: async (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
    const response = await api.get('/admin/students', { params });
    return response.data.data;
  },

  getAllCounsellors: async (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
    const response = await api.get('/admin/counsellors', { params });
    return response.data.data;
  },

  getAllVolunteers: async (params?: { limit?: number; offset?: number; search?: string; status?: string }) => {
    const response = await api.get('/admin/volunteers', { params });
    return response.data.data;
  },

  getAllReports: async (params?: { limit?: number; offset?: number; status?: string; priority?: string }) => {
    const response = await api.get('/admin/reports', { params });
    return response.data.data;
  },

  assignReport: async (reportId: string, counsellorId: string) => {
    const response = await api.post('/admin/reports/assign', { reportId, counsellorId });
    return response.data;
  },

  updateUserStatus: async (userId: string, userModel: string, status: boolean) => {
    const response = await api.put('/admin/users/status', { userId, userModel, status });
    return response.data;
  },

  getSystemAnalytics: async (params?: { startDate?: string; endDate?: string; period?: string }) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data.data;
  },

  emergencyAccess: async (userId: string, userModel: string, action: 'enable' | 'disable') => {
    const response = await api.post('/admin/emergency-access', { userId, userModel, action });
    return response.data;
  },

  getUserById: async (userId: string, userModel: string) => {
    const response = await api.get(`/admin/users/${userId}/${userModel}`);
    return response.data.data;
  },

  sendSystemNotification: async (notification: any) => {
    const response = await api.post('/admin/notifications/system', notification);
    return response.data;
  }
};

// Booking API
export const bookingAPI = {
  createBooking: async (data: any) => {
    const response = await api.post('/bookings/student', data);
    return response.data;
  },

  getMyBookings: async (params?: { limit?: number; offset?: number; status?: string }) => {
    const response = await api.get('/bookings/student', { params });
    return response.data.data;
  },

  getBookingById: async (id: string) => {
    const response = await api.get(`/bookings/student/${id}`);
    return response.data.data;
  },

  updateBooking: async (id: string, data: any) => {
    const response = await api.put(`/bookings/student/${id}`, data);
    return response.data;
  },

  cancelBooking: async (id: string) => {
    const response = await api.delete(`/bookings/student/${id}`);
    return response.data;
  },

  rescheduleBooking: async (id: string, data: any) => {
    const response = await api.put(`/bookings/student/${id}/reschedule`, data);
    return response.data;
  },

  // Counsellor booking management
  getCounsellorBookings: async (params?: { limit?: number; offset?: number; status?: string }) => {
    const response = await api.get('/bookings/counsellor', { params });
    return response.data.data;
  },

  getCounsellorSchedule: async () => {
    const response = await api.get('/bookings/counsellor/schedule');
    return response.data.data;
  },

  confirmBooking: async (id: string) => {
    const response = await api.put(`/bookings/counsellor/${id}/confirm`);
    return response.data;
  },

  rejectBooking: async (id: string, reason?: string) => {
    const response = await api.put(`/bookings/counsellor/${id}/reject`, { reason });
    return response.data;
  },

  completeBooking: async (id: string, notes?: string) => {
    const response = await api.put(`/bookings/counsellor/${id}/complete`, { notes });
    return response.data;
  },

  getAvailableSlots: async (counsellorId: string, date?: string) => {
    const response = await api.get(`/bookings/slots/${counsellorId}`, { params: { date } });
    return response.data.data;
  }
};

// Report API
export const reportAPI = {
  createReport: async (data: any) => {
    const response = await api.post('/reports/my', data);
    return response.data;
  },

  getMyReports: async (params?: { limit?: number; offset?: number; status?: string }) => {
    const response = await api.get('/reports/my', { params });
    return response.data.data;
  },

  getReportById: async (id: string) => {
    const response = await api.get(`/reports/my/${id}`);
    return response.data.data;
  },

  updateReport: async (id: string, data: any) => {
    const response = await api.put(`/reports/my/${id}`, data);
    return response.data;
  },

  deleteReport: async (id: string) => {
    const response = await api.delete(`/reports/my/${id}`);
    return response.data;
  },

  // Counsellor report management
  getAssignedReports: async (params?: { limit?: number; offset?: number; status?: string }) => {
    const response = await api.get('/reports/assigned', { params });
    return response.data.data;
  },

  getReportDetails: async (id: string) => {
    const response = await api.get(`/reports/assigned/${id}`);
    return response.data.data;
  },

  updateReportStatus: async (id: string, status: string, notes?: string) => {
    const response = await api.put(`/reports/assigned/${id}/status`, { status, notes });
    return response.data;
  },

  // Public/Admin access
  getUrgentReports: async () => {
    const response = await api.get('/reports/urgent');
    return response.data.data;
  },

  getReportsByStatus: async (status: string, params?: { limit?: number; offset?: number }) => {
    const response = await api.get(`/reports/status/${status}`, { params });
    return response.data.data;
  }
};

// Feedback API
export const feedbackAPI = {
  createFeedback: async (data: any) => {
    const response = await api.post('/feedback', data);
    return response.data;
  },

  getFeedback: async (targetId: string, targetModel: string) => {
    const response = await api.get('/feedback', { params: { targetId, targetModel } });
    return response.data.data;
  },

  getMyFeedback: async () => {
    const response = await api.get('/feedback/my');
    return response.data.data;
  },

  updateFeedback: async (id: string, data: any) => {
    const response = await api.put(`/feedback/${id}`, data);
    return response.data;
  },

  deleteFeedback: async (id: string) => {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  },

  getFeedbackStats: async (targetId: string, targetModel: string) => {
    const response = await api.get('/feedback/stats', { params: { targetId, targetModel } });
    return response.data.data;
  },

  getTopRated: async (targetModel: string, limit?: number) => {
    const response = await api.get('/feedback/top-rated', { params: { targetModel, limit } });
    return response.data.data;
  }
};

// Room API (Peer Support)
export const roomAPI = {
  getAllRooms: async () => {
    const response = await api.get('/rooms');
    return response.data.data;
  },

  getRoomByTopic: async (topic: string) => {
    const response = await api.get(`/rooms/${topic}`);
    return response.data.data;
  },

  getRoomMessages: async (roomId: string, params?: { limit?: number; offset?: number }) => {
    const response = await api.get(`/rooms/${roomId}/messages`, { params });
    return response.data.data;
  },

  getRoomStats: async (roomId: string) => {
    const response = await api.get(`/rooms/${roomId}/stats`);
    return response.data.data;
  },

  getRoomActivity: async (roomId: string) => {
    const response = await api.get(`/rooms/${roomId}/activity`);
    return response.data.data;
  },

  // Admin only
  addModerator: async (roomId: string, volunteerId: string) => {
    const response = await api.post(`/rooms/${roomId}/moderators`, { volunteerId });
    return response.data;
  },

  removeModerator: async (roomId: string, volunteerId: string) => {
    const response = await api.delete(`/rooms/${roomId}/moderators/${volunteerId}`);
    return response.data;
  },

  updateRoomDescription: async (roomId: string, description: string) => {
    const response = await api.put(`/rooms/${roomId}/description`, { description });
    return response.data;
  }
};

// Notification API
export const notificationAPI = {
  getUserNotifications: async (params?: { 
    limit?: number; 
    offset?: number; 
    unreadOnly?: boolean; 
    category?: string;
    includeArchived?: boolean;
    includeExpired?: boolean;
  }) => {
    const response = await api.get('/notifications', { params });
    return response.data.data;
  },

  getUnreadCount: async (category?: string) => {
    const response = await api.get('/notifications/unread', { params: { category } });
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (category?: string) => {
    const response = await api.put('/notifications/read-all', { category });
    return response.data;
  },

  archiveNotification: async (id: string) => {
    const response = await api.put(`/notifications/${id}/archive`);
    return response.data;
  },

  unarchiveNotification: async (id: string) => {
    const response = await api.put(`/notifications/${id}/unarchive`);
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data.data;
  },

  updatePreferences: async (preferences: any) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  }
};

// Export all APIs
export const API = {
  auth: authAPI,
  student: studentAPI,
  counsellor: counsellorAPI,
  volunteer: volunteerAPI,
  admin: adminAPI,
  booking: bookingAPI,
  report: reportAPI,
  feedback: feedbackAPI,
  room: roomAPI,
  notification: notificationAPI
};

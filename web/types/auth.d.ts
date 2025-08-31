// FILE: web/types/auth.d.ts

// Enhanced user types matching the backend models

interface BaseUser {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'counsellor' | 'volunteer' | 'admin';
  profileImage?: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Student interface matching backend model
export interface Student extends BaseUser {
  role: 'student';
  studentId: string;
  academicYear?: number;
  department?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  counsellorsConnected: string[]; // Array of Counsellor IDs
  volunteersConnected: string[]; // Array of Volunteer IDs
  reports: string[]; // Array of Report IDs
  preferences?: {
    preferredTopics: string[];
    notificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  lastActive?: string;
}

// Counsellor interface matching backend model
export interface Counsellor extends BaseUser {
  role: 'counsellor';
  qualifications: string[];
  experience: number;
  specialization: string[];
  licenseNumber: string;
  maxStudents: number;
  availableTime: {
    startTime: string;
    endTime: string;
    days: string[];
  };
  students: string[]; // Array of Student IDs
  assignedReports: string[]; // Array of Report IDs
  feedback: Array<{
    rating: number;
    comment?: string;
    studentId: string;
    createdAt: string;
  }>;
  isActive: boolean;
}

// Volunteer interface matching backend model
export interface Volunteer extends BaseUser {
  role: 'volunteer';
  description?: string; // <-- FIX: Added missing property
  skills: string[];
  interests: string[];
  experience: number;
  availability: 'full_time' | 'part_time' | 'weekends' | 'evenings';
  preferredTopics: string[];
  maxConcurrentChats: number;
  trainingCompleted: boolean;
  moderatedRooms: string[]; // Array of Room IDs
  lastActive?: string;
  isActive: boolean;
}

// Admin interface matching backend model
export interface Admin extends BaseUser {
  role: 'admin';
  permissions: Array<
    | 'manage_users'
    | 'manage_reports'
    | 'manage_bookings'
    | 'view_analytics'
    | 'system_settings'
    | 'emergency_access'
  >;
  isSuperAdmin: boolean;
  lastLogin?: string;
  emergencyAccess: boolean;
}

// Union type for all user types
export type User = Student | Counsellor | Volunteer | Admin;

// Authentication response types
export interface AuthResponse {
  success: boolean;
  user: User;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: 'student' | 'counsellor' | 'volunteer' | 'admin';
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  confirmPassword: string;
  // Role-specific fields
  studentId?: string;
  academicYear?: number;
  department?: string;
  qualifications?: string[];
  experience?: number;
  specialization?: string[];
  licenseNumber?: string;
  skills?: string[];
  interests?: string[];
  availability?: string;
  preferredTopics?: string[];
  permissions?: string[];
}

// Session management
export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    categories: {
      booking: boolean;
      chat: boolean;
      report: boolean;
      system: boolean;
      connection: boolean;
      feedback: boolean;
      emergency: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections_only';
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
  };
}
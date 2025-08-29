import { z } from "zod";
import { ValidationError } from "./error.middleware.js";

// Common validation schemas
export const paginationSchema = z.object({
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional().default("20"),
  offset: z.string().transform(val => parseInt(val)).pipe(z.number().min(0)).optional().default("0"),
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional()
});

export const searchSchema = z.object({
  q: z.string().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
});

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const userLoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1)
});

export const userProfileUpdateSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  profileImage: z.string().url().optional(),
  contactNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/).optional(),
  emergencyContact: z.object({
    name: z.string().min(2).max(50),
    relationship: z.string().min(2).max(30),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
    email: z.string().email().optional()
  }).optional()
});

// Student validation schemas
export const studentRegistrationSchema = userRegistrationSchema.extend({
  studentId: z.string().min(5).max(20).trim(),
  academicYear: z.number().min(1).max(6).optional(),
  department: z.string().min(2).max(50).trim().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional()
});

export const studentProfileUpdateSchema = userProfileUpdateSchema.extend({
  academicYear: z.number().min(1).max(6).optional(),
  department: z.string().min(2).max(50).trim().optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  preferences: z.object({
    preferredTopics: z.array(z.string()).max(10).optional(),
    notificationSettings: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      sms: z.boolean().optional()
    }).optional()
  }).optional()
});

// Counsellor validation schemas
export const counsellorRegistrationSchema = userRegistrationSchema.extend({
  qualifications: z.array(z.string().min(2).max(100)).min(1).max(10),
  experience: z.number().min(0).max(50),
  specialization: z.array(z.string().min(2).max(50)).min(1).max(5),
  licenseNumber: z.string().min(5).max(20).trim(),
  maxStudents: z.number().min(1).max(100).optional().default(20)
});

export const counsellorProfileUpdateSchema = userProfileUpdateSchema.extend({
  qualifications: z.array(z.string().min(2).max(100)).max(10).optional(),
  experience: z.number().min(0).max(50).optional(),
  specialization: z.array(z.string().min(2).max(50)).max(5).optional(),
  licenseNumber: z.string().min(5).max(20).trim().optional(),
  maxStudents: z.number().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  availableTime: z.object({
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    days: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]))
  }).optional()
});

// Volunteer validation schemas
export const volunteerRegistrationSchema = userRegistrationSchema.extend({
  skills: z.array(z.string().min(2).max(50)).min(1).max(10),
  interests: z.array(z.string().min(2).max(50)).min(1).max(10),
  experience: z.number().min(0).max(50),
  availability: z.enum(["full_time", "part_time", "weekends", "evenings"]),
  preferredTopics: z.array(z.string().min(2).max(50)).min(1).max(10),
  maxConcurrentChats: z.number().min(1).max(10).optional().default(3)
});

export const volunteerProfileUpdateSchema = userProfileUpdateSchema.extend({
  skills: z.array(z.string().min(2).max(50)).max(10).optional(),
  interests: z.array(z.string().min(2).max(50)).max(10).optional(),
  experience: z.number().min(0).max(50).optional(),
  availability: z.enum(["full_time", "part_time", "weekends", "evenings"]).optional(),
  preferredTopics: z.array(z.string().min(2).max(50)).max(10).optional(),
  maxConcurrentChats: z.number().min(1).max(10).optional(),
  isActive: z.boolean().optional()
});

// Admin validation schemas
export const adminRegistrationSchema = userRegistrationSchema.extend({
  permissions: z.array(z.enum([
    "manage_users",
    "manage_reports",
    "manage_bookings",
    "view_analytics",
    "system_settings",
    "emergency_access"
  ])).min(1),
  isSuperAdmin: z.boolean().optional().default(false)
});

export const adminProfileUpdateSchema = userProfileUpdateSchema.extend({
  permissions: z.array(z.enum([
    "manage_users",
    "manage_reports",
    "manage_bookings",
    "view_analytics",
    "system_settings",
    "emergency_access"
  ])).optional(),
  isSuperAdmin: z.boolean().optional()
});

// Booking validation schemas
export const createBookingSchema = z.object({
  counsellorId: z.string().min(24).max(24),
  date: z.string().datetime(),
  timeSlot: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().min(30).max(180).optional().default(60),
  reason: z.string().min(10).max(500).trim(),
  urgency: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  preferredMode: z.enum(["video", "audio", "chat", "in_person"]).optional().default("video")
});

export const updateBookingSchema = z.object({
  date: z.string().datetime().optional(),
  timeSlot: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: z.number().min(30).max(180).optional(),
  reason: z.string().min(10).max(500).trim().optional(),
  urgency: z.enum(["low", "medium", "high", "urgent"]).optional(),
  preferredMode: z.enum(["video", "audio", "chat", "in_person"]).optional()
});

// Report validation schemas
export const createReportSchema = z.object({
  title: z.string().min(5).max(100).trim(),
  content: z.string().min(20).max(2000).trim(),
  category: z.enum([
    "academic_stress",
    "personal_issues",
    "mental_health",
    "bullying",
    "family_problems",
    "relationship_issues",
    "financial_stress",
    "other"
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  isAnonymous: z.boolean().optional().default(false),
  tags: z.array(z.string().min(2).max(20)).max(10).optional(),
  attachments: z.array(z.string().url()).max(5).optional()
});

export const updateReportSchema = z.object({
  title: z.string().min(5).max(100).trim().optional(),
  content: z.string().min(20).max(2000).trim().optional(),
  category: z.enum([
    "academic_stress",
    "personal_issues",
    "mental_health",
    "bullying",
    "family_problems",
    "relationship_issues",
    "financial_stress",
    "other"
  ]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  tags: z.array(z.string().min(2).max(20)).max(10).optional(),
  attachments: z.array(z.string().url()).max(5).optional()
});

// Feedback validation schemas
export const createFeedbackSchema = z.object({
  targetId: z.string().min(24).max(24),
  targetModel: z.enum(["Counsellor", "Volunteer", "Room"]),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500).trim().optional(),
  category: z.enum(["service", "communication", "effectiveness", "overall"]).optional().default("overall")
});

export const updateFeedbackSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10).max(500).trim().optional(),
  category: z.enum(["service", "communication", "effectiveness", "overall"]).optional()
});

// Message validation schemas
export const createMessageSchema = z.object({
  roomId: z.string().min(24).max(24),
  content: z.string().min(1).max(2000).trim(),
  messageType: z.enum(["text", "image", "file", "system", "announcement"]).optional().default("text"),
  replyTo: z.string().min(24).max(24).optional(),
  mentions: z.array(z.string().min(24).max(24)).max(10).optional()
});

export const updateMessageSchema = z.object({
  content: z.string().min(1).max(2000).trim()
});

// Room validation schemas
export const createRoomSchema = z.object({
  topic: z.string().min(3).max(50).trim(),
  description: z.string().min(10).max(500).trim().optional(),
  isPrivate: z.boolean().optional().default(false),
  maxParticipants: z.number().min(2).max(100).optional().default(50),
  tags: z.array(z.string().min(2).max(20)).max(10).optional()
});

export const updateRoomSchema = z.object({
  description: z.string().min(10).max(500).trim().optional(),
  isPrivate: z.boolean().optional(),
  maxParticipants: z.number().min(2).max(100).optional(),
  tags: z.array(z.string().min(2).max(20)).max(10).optional()
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  recipients: z.array(z.object({
    userId: z.string().min(24).max(24),
    userModel: z.enum(["Student", "Counsellor", "Volunteer", "Admin"])
  })).min(1),
  type: z.enum([
    "booking_request",
    "booking_confirmed",
    "booking_rejected",
    "booking_cancelled",
    "booking_reminder",
    "message_received",
    "report_assigned",
    "report_resolved",
    "feedback_received",
    "connection_request",
    "connection_accepted",
    "connection_rejected",
    "room_invitation",
    "moderator_assigned",
    "system_announcement",
    "emergency_alert",
    "training_completed",
    "availability_update",
    "performance_review",
    "account_verification"
  ]),
  title: z.string().min(1).max(100).trim(),
  message: z.string().min(1).max(500).trim(),
  data: z.record(z.any()).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal")
});

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      // Update request with validated data
      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.query) req.query = validatedData.query;
      if (validatedData.params) req.params = validatedData.params;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError("Validation failed", error.errors));
      } else {
        next(error);
      }
    }
  };
};

// Export all schemas for use in controllers
export const schemas = {
  pagination: paginationSchema,
  search: searchSchema,
  userRegistration: userRegistrationSchema,
  userLogin: userLoginSchema,
  userProfileUpdate: userProfileUpdateSchema,
  studentRegistration: studentRegistrationSchema,
  studentProfileUpdate: studentProfileUpdateSchema,
  counsellorRegistration: counsellorRegistrationSchema,
  counsellorProfileUpdate: counsellorProfileUpdateSchema,
  volunteerRegistration: volunteerRegistrationSchema,
  volunteerProfileUpdate: volunteerProfileUpdateSchema,
  adminRegistration: adminRegistrationSchema,
  adminProfileUpdate: adminProfileUpdateSchema,
  createBooking: createBookingSchema,
  updateBooking: updateBookingSchema,
  createReport: createReportSchema,
  updateReport: updateReportSchema,
  createFeedback: createFeedbackSchema,
  updateFeedback: updateFeedbackSchema,
  createMessage: createMessageSchema,
  updateMessage: updateMessageSchema,
  createRoom: createRoomSchema,
  updateRoom: updateRoomSchema,
  createNotification: createNotificationSchema
};

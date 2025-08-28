
interface BaseUser {
  _id: string;
  email: string;
  role: 'student' | 'counsellor' | 'volunteer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Specific interface for the Student user type.
export interface Student extends BaseUser {
  role: 'student';
  name: string;
  studentCode: string;
  counsellorConnected: string[]; // Array of Counsellor IDs
  volunteerConnected: string[]; // Array of Volunteer IDs
}

// Specific interface for the Counsellor user type.
export interface Counsellor extends BaseUser {
  role: 'counsellor';
  name: string;
  specialization: string;
  description: string;
  // availableTime can have a more specific type if needed
  availableTime: any[]; 
  students: string[]; // Array of Student IDs
}

// Specific interface for the Volunteer user type.
export interface Volunteer extends BaseUser {
  role: 'volunteer';
  name: string;
  description: string;
}

// Specific interface for the Admin user type.
export interface Admin extends BaseUser {
  role: 'admin';
  // Admin might not have a `name` field based on the schema, only email
  counsellors: string[]; // Array of Counsellor IDs
  volunteers: string[]; // Array of Volunteer IDs
}

// A union type that can represent any of the possible logged-in user types.
// This is the type you will use in your Zustand store and AuthProvider.
export type User = Student | Counsellor | Volunteer | Admin;
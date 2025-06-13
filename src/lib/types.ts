// src/lib/types.ts
export interface User {
  username: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: User;
}

export interface ApiResponse {
  message: string;
  user?: User;
}

export interface CourseAssignment {
  _id?: string;
  university: string;
  course: string;
  specialization: string;
  assignedAt: string;
  studentId?: string; // Make optional for backward compatibility
  externalApiStatus?: boolean; // Make optional for backward compatibility
  externalApiExists?: number; // Make optional for backward compatibility
  externalApiMessage?: string; // Make optional for backward compatibility
}

export interface DatabaseUser {
  _id: string;
  name?: string;
  email?: string;
  companyEmail?: string;
  phoneNumber: string;
  officeEmail?: string;
  cinPanGst?: string;
  dateOfBirth?: string; // Add dateOfBirth field
  agreeToTerms: boolean;
  isRecruiter: boolean;
  isVerified: boolean;
  remarks?: string;
  // New course assignments field (multiple courses support)
  assignedCourses?: CourseAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface ExternalApiResponse {
  status: boolean;
  student_id: string;
  message: string;
  exists: number;
}

export interface ExternalApiRequest {
  full_name: string;
  email: string;
  mobile: string;
  dob: string;
  interested_university: string;
  course: string;
  specialization: string;
  source: string;
  sub_source: string;
  lead_owner: string;
}

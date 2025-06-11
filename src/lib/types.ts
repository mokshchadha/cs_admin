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
  university: string;
  course: string;
  specialization: string;
  assignedAt: string;
}

export interface DatabaseUser {
  _id: string;
  name?: string;
  email?: string;
  companyEmail?: string;
  phoneNumber: string;
  officeEmail?: string;
  cinPanGst?: string;
  agreeToTerms: boolean;
  isRecruiter: boolean;
  isVerified: boolean;
  remarks?: string;
  // New course assignments field (multiple courses support)
  assignedCourses?: CourseAssignment[];
  createdAt: string;
  updatedAt: string;
}

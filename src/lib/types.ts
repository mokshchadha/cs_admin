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
  createdAt: string;
  updatedAt: string;
}

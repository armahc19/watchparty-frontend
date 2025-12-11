export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}
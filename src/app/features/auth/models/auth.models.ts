export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  isSuccess: boolean;
  errorCode: string;
  value: {
    requiresTwoFactor: boolean;
    token: string;
    userId: string;
  };
}

export interface TwoFactorRequest {
  userId: string;
  code: string;
}

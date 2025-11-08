export interface LoginCredentials {
  email: string;
  password: string;
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

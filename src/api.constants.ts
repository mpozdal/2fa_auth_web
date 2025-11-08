export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    TWOFA_VERIFY: '/api/auth/verify2fa',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/revoke',
    USER_INFO: '/api/auth/me',
  },
  TWO_FA: {
    GENERATE: '/api/2fa/generate',
    ENABLE: '/api/2fa/enable',
    SETUP: '/api/2fa/setup',
    DISABLE: '/api/2fa',
  },
};

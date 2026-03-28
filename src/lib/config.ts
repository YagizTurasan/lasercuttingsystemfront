export const API_CONFIG = {
  BASE_URL: 'https://localhost:7206/api',
  TIMEOUT: 10000,
  
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/Auth/login',
      REGISTER: '/Auth/register',
      REFRESH_TOKEN: '/Auth/refresh-token',
      LOGOUT: '/Auth/logout',
      FORGOTPASSWORD: '/Auth/forgot-password',
      RESETPASSWORD: '/Auth/reset-password',
      CHANGEPASSWORD: '/Auth/change-password',
      SENDEMAILVERIFICATION: '/Auth/send-email-verification',
      VERIFYEMAIL: '/Auth/verify-email',
      PROFILE: '/Auth/profile',
    },
    ERROR_CODES: {
      FREE: '/ErrorCodes/free',
      BY_ID: (id: string) => `/ErrorCodes/${id}`,
      SEARCH: '/ErrorCodes/search',
      BY_MACHINE: (machineId: string) => `/ErrorCodes/by-machine/${machineId}`,
      SOURCES: '/ErrorCodes/sources',
      ACCESSINFO: '/ErrorCodes/access-info'
    },
    MACHINES: {
      ALL: '/Machine',
      BY_ID: (id: string) => `/Machine/${id}`,
      SELECTED: '/Machine/selected',
      SELECT: (id: string) => `/Machine/${id}/select`,
      UNSELECT: (id: string) => `/Machine/${id}/unselect`,
      SEARCH: '/Machine/search',
      GETMACHINEMODEL: (id: string) => `/Machine/${id}/models`,
      GETMODELSECTIONS: (modelId: string) => `/Machine/models/${modelId}/sections`,
      GETSECTIONPART: (sectionId: string) => `/Machine/sections/${sectionId}/parts`,
      SELECTIONSTATUS: '/Machine/selection-status'
    },
    SUBSCRIPTION: {
        PLANS: '/Subscription/plans',
        CURRENTSUBSCRIPTION: '/Subscription/current',
        HISTORY: '/Subscription/history',
        SUBSCRIBE: '/Subscription/subscribe',
        CANCEL: '/Subscription/cancel',
        RENEW: '/Subscription/renew',
        PAYMENT: '/Subscription/payments',
        MACHINESELECTIONINFO: '/Subscription/machine-selection-info',
        SUMMARY: '/Subscription/summary',
        COMPARE: '/Subscription/compare',
    },
    USERS: {
        GETPROFILE: '/Users/profile',
        UPDATEPROFILE: '/Users/profile',
        DEACTIVATE: (id: string) => `/Users/${id}/deactivate`,
        ACTIVATE: (id: string) => `/Users/${id}/activate`
    }
  }
};
export const API_ENDPOINTS = {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
    },
    ANTIBIA: {
      PROFILE: '/api/antibia/profile',
      LEAVES: {
        BALANCE: '/api/antibia/leaves/balance',
        REQUEST: '/api/antibia/leaves/request',
        HISTORY: '/api/antibia/leaves/history',
      },
      PAYSLIPS: '/api/antibia/payslips',
      TRAININGS: '/api/antibia/trainings',
    },
    CHAT: {
      CONVERSATIONS: '/api/chat/conversations',
      EXPORT: '/api/chat/export',
    }
  };
  
  export const SOCKET_EVENTS = {
    // Client vers serveur
    SEND_MESSAGE: 'send_message',
    QUICK_ACTION: 'quick_action',
    JOIN_CONVERSATION: 'join_conversation',
    
    // Serveur vers client
    BOT_RESPONSE: 'bot_response',
    ACTION_RESULT: 'action_result',
    ACTION_ERROR: 'action_error',
    ERROR: 'error',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
  };
  
  export const QUICK_ACTIONS = {
    LEAVES: {
      VIEW: 'view_leaves',
      REQUEST: 'request_leave',
      HISTORY: 'leave_history',
    },
    PAYROLL: {
      VIEW: 'view_payslip',
      DOWNLOAD: 'download_payslip',
      HISTORY: 'payslip_history',
    },
    TRAINING: {
      VIEW: 'view_trainings',
      ENROLL: 'enroll_training',
      MY_TRAININGS: 'my_trainings',
    },
    GENERAL: {
      HELP: 'help',
      CONTACT: 'contact_hr',
    }
  };
  
  export const MESSAGE_TYPES = {
    USER: 'user' as const,
    BOT: 'bot' as const,
    SYSTEM: 'system' as const,
  };
  
  export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    ERROR: 'error',
  };
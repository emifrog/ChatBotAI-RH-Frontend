export interface User {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    antibiaId: string;
  }
  
  export interface AuthUser extends User {
    // Propriétés supplémentaires pour l'authentification
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface Message {
    id: string;
    type: 'user' | 'bot' | 'system';
    content: string;
    timestamp: Date;
    intent?: string;
    actions?: QuickAction[];
    metadata?: any;
  }
  
  export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    action: string;
    params?: any;
  }
  
  export interface LeaveBalance {
    paidLeave: number;
    rtt: number;
    sickLeave: number;
    lastUpdate: string;
  }
  
  export interface Payslip {
    id: string;
    period: string;
    netSalary: number;
    grossSalary: number;
    downloadUrl: string;
  }
  
  export interface Training {
    id: string;
    title: string;
    description: string;
    duration: string;
    availableSpots: number;
    recommended: boolean;
  }
  
  export interface UserProfile {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    manager: string;
    hireDate: string;
  }
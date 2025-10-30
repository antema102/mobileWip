export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: 'employee' | 'manager' | 'admin';
  hourlyRate: number;
  department?: string;
  position?: string;
  faceDescriptor?: number[];
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  role: string;
  token: string;
}

export interface Attendance {
  _id: string;
  user: User | string;
  checkIn: string;
  checkOut?: string;
  checkInMethod: 'facial' | 'manual';
  checkOutMethod?: 'facial' | 'manual';
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
  };
  workHours: number;
  status: 'active' | 'completed';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Salary {
  _id: string;
  user: User | string;
  period: {
    month: number;
    year: number;
  };
  totalHours: number;
  hourlyRate: number;
  grossSalary: number;
  deductions: number;
  bonuses: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

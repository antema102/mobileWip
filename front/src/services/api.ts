import axios from 'axios';
import {API_URL, ENDPOINTS} from '../utils/config';
import {storage} from '../utils/storage';
import {AuthResponse, User, Attendance, Salary} from '../types';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async config => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      storage.clear();
    }
    return Promise.reject(error);
  },
);

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post(ENDPOINTS.LOGIN, {email, password});
    return response.data;
  },

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    employeeId: string;
    hourlyRate: number;
    department?: string;
    position?: string;
  }): Promise<AuthResponse> {
    const response = await api.post(ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get(ENDPOINTS.ME);
    return response.data;
  },
};

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get(ENDPOINTS.USERS);
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get(ENDPOINTS.USER_BY_ID(id));
    return response.data;
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(ENDPOINTS.USER_BY_ID(id), userData);
    return response.data;
  },

  async updateFaceDescriptor(
    id: string,
    faceDescriptor: number[],
  ): Promise<any> {
    const response = await api.put(ENDPOINTS.UPDATE_FACE(id), {
      faceDescriptor,
    });
    return response.data;
  },
};

export const attendanceService = {
  async checkIn(data: {
    userId: string;
    method?: string;
    location?: {latitude: number; longitude: number};
    faceDescriptor?: number[];
  }): Promise<Attendance> {
    const response = await api.post(ENDPOINTS.CHECK_IN, data);
    return response.data;
  },

  async checkOut(data: {
    userId: string;
    method?: string;
    location?: {latitude: number; longitude: number};
  }): Promise<Attendance> {
    const response = await api.put(ENDPOINTS.CHECK_OUT, data);
    return response.data;
  },

  async getUserAttendance(
    userId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Attendance[]> {
    const params = startDate && endDate ? {startDate, endDate} : {};
    const response = await api.get(ENDPOINTS.USER_ATTENDANCE(userId), {
      params,
    });
    return response.data;
  },

  async getTodayAttendance(userId: string): Promise<Attendance | null> {
    const response = await api.get(ENDPOINTS.TODAY_ATTENDANCE(userId));
    return response.data;
  },

  async getAllAttendance(
    startDate?: string,
    endDate?: string,
  ): Promise<Attendance[]> {
    const params = startDate && endDate ? {startDate, endDate} : {};
    const response = await api.get(ENDPOINTS.ALL_ATTENDANCE, {params});
    return response.data;
  },
};

export const salaryService = {
  async calculateSalary(data: {
    userId: string;
    month: number;
    year: number;
    deductions?: number;
    bonuses?: number;
  }): Promise<Salary> {
    const response = await api.post(ENDPOINTS.CALCULATE_SALARY, data);
    return response.data;
  },

  async getUserSalary(userId: string): Promise<Salary[]> {
    const response = await api.get(ENDPOINTS.USER_SALARY(userId));
    return response.data;
  },

  async getCurrentMonthSalary(userId: string): Promise<Salary | null> {
    const response = await api.get(ENDPOINTS.CURRENT_SALARY(userId));
    return response.data;
  },

  async getAllSalaries(month?: number, year?: number): Promise<Salary[]> {
    const params = month && year ? {month, year} : {};
    const response = await api.get(ENDPOINTS.ALL_SALARIES, {params});
    return response.data;
  },

  async updateSalaryStatus(id: string, status: string): Promise<Salary> {
    const response = await api.put(`${ENDPOINTS.ALL_SALARIES}/${id}`, {
      status,
    });
    return response.data;
  },
};

export default api;

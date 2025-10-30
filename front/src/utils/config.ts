export const API_URL = 'http://localhost:3000/api';

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  UPDATE_FACE: (id: string) => `/users/${id}/face`,
  
  // Attendance
  CHECK_IN: '/attendance/checkin',
  CHECK_OUT: '/attendance/checkout',
  USER_ATTENDANCE: (userId: string) => `/attendance/user/${userId}`,
  TODAY_ATTENDANCE: (userId: string) => `/attendance/today/${userId}`,
  ALL_ATTENDANCE: '/attendance',
  
  // Salary
  CALCULATE_SALARY: '/salary/calculate',
  USER_SALARY: (userId: string) => `/salary/user/${userId}`,
  CURRENT_SALARY: (userId: string) => `/salary/current/${userId}`,
  ALL_SALARIES: '/salary',
};

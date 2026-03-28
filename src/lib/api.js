// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const USER_API = `${API_BASE_URL}/api/v1/user`;
export const COURSE_API = `${API_BASE_URL}/api/v1/course`;
export const COURSE_PURCHASE_API = `${API_BASE_URL}/api/v1/purchase`;
export const COURSE_PROGRESS_API = `${API_BASE_URL}/api/v1/progress`;
export const MEDIA_API = `${API_BASE_URL}/api/v1/media`;

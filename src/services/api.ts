import type { User, Course, SignupInput, SigninInput } from '@/lib/schemas';
import { UserSchema } from '@/lib/schemas';
import { useAuthStore } from '@/lib/store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('Missing environment variable: VITE_API_BASE_URL');
}

interface AuthResponse {
  access_token: string;
  user: User;
}


async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  // Get token from Zustand store
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorMessage;
      } catch {
        // Ignore if response body isn't JSON or is empty
      }
      console.error(`API Error on ${endpoint}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Handle cases with no content expected (e.g., logout, potentially subscribe if it returns 204)
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return undefined as T; // Return undefined for no content
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Network or fetch error on ${endpoint}:`, error);
    throw error instanceof Error ? error : new Error('An unknown network error occurred');
  }
}

const api = {
  // --- Auth ---
  signup: async (data: SignupInput): Promise<AuthResponse> => {
    console.log('API: Attempting signup with', data);
    const response = await fetchApi<AuthResponse>('/user/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('API: Signup successful', response);
    return response;
  },

  signin: async (data: SigninInput): Promise<AuthResponse> => {
    console.log('API: Attempting signin with', data);
    const response = await fetchApi<AuthResponse>('/user/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('API: Signin successful', response);
    return response;
  },

  logout: async (): Promise<void> => {
     console.log('API: Logout function called (no backend action implemented). Store cleared in component.');
     return Promise.resolve();
  },


  // --- Subscription ---
  subscribe: async (): Promise<User> => {
    console.log('API: Attempting subscription');
    const userData = await fetchApi<unknown>('/user/subscribe', { method: 'POST' });
    const validationResult = UserSchema.safeParse(userData);
    if (!validationResult.success) {
      console.error('API Subscribe Error: Invalid user data returned', validationResult.error);
      throw new Error('Subscription failed: Invalid data received');
    }
    console.log('API: Subscription successful, received user:', validationResult.data);
    return validationResult.data;
  },

  // --- Courses ---
  getCourses: async (): Promise<Course[]> => {
    console.log('API: Getting all courses');
    const courses = await fetchApi<Course[]>('/courses');
    console.log('API: Fetched all courses:', courses);
    return courses;
  },

  getUserCourses: async (): Promise<Course[]> => {
    console.log('API: Getting user courses');
    // Assuming backend returns valid Course data associated with the user
    const userCourses = await fetchApi<Course[]>('/courses/user');
    console.log('API: Fetched user courses:', userCourses);
    return userCourses;
  },

  enrollCourse: async (courseId: string): Promise<User> => {
    console.log(`API: Enrolling in course ${courseId}`);
    const userData = await fetchApi<unknown>('/courses/add', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
    // Validate response against UserSchema
    const validationResult = UserSchema.safeParse(userData);
     if (!validationResult.success) {
      console.error('API Enroll Error: Invalid user data returned', validationResult.error);
      throw new Error('Enrollment failed: Invalid data received');
    }
    console.log('API: User enrolled, updated user:', validationResult.data);
    // Component will update the store or refetch user courses
    return validationResult.data;
  },
};

export default api; 
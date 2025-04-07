// Import schema types from the schemas package
import type { User, Course, SignupSchema, SigninSchema, SignupInput, SigninInput } from '@/lib/schemas';

// Re-export schema types
export type { User, Course, SignupSchema, SigninSchema, SignupInput, SigninInput };

// Re-export other types 
export * from './AuthContext.types'; 
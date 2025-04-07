import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/lib/store/auth.store';
import api from '@/services/api';
import { SignupSchema } from '@/lib/schemas';
import type { SignupInput } from '@/lib/types';
import { toast } from 'sonner';

export function SignupPage() {
  const { isAuthenticated, setAuth, token, user } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupInput>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && token && user) {
      console.log('Signup: User is authenticated, navigating to dashboard');
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, token, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: SignupInput) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
    }
    setApiError(null);
  };

  const validateForm = (): boolean => {
    const result = SignupSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.signup(formData);
      console.log('Signup successful:', response);
      setAuth(response.access_token, response.user);
      
      // Show success toast
      toast.success('Account created successfully!', {
        description: `Welcome to CourseHub, ${response.user.first_name}!`,
      });
      
      // Immediate navigation after successful signup
      console.log('Navigating to dashboard after successful signup');
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Signup failed:', error);
      setApiError(error instanceof Error ? error.message : 'An unknown error occurred.');
      setFormData((prev: SignupInput) => ({ ...prev, password: '' }));
      
      // Show error toast
      toast.error('Signup failed', {
        description: error instanceof Error ? error.message : 'Please check your information and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && token && user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecting to Dashboard...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
        {/* Add a manual navigation option if redirect fails */}
        <button 
          onClick={() => navigate({ to: '/dashboard' })}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Create your CourseHub account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">sign in to your existing account</Link>
          </p>
        </div>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Signup Failed: </strong>
            <span className="block sm:inline">{apiError}</span>
          </div>
        )}

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                autoComplete="given-name"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  formErrors.first_name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm`}
                placeholder="First Name"
              />
              {formErrors.first_name && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.first_name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-xs text-gray-500">(Optional)</span>
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  formErrors.last_name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm`}
                placeholder="Last Name"
              />
              {formErrors.last_name && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.last_name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm`}
                placeholder="Email address"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-xs text-gray-500">(min 8 chars, needs letter, number, special char)</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`appearance-none relative block w-full px-3 py-3 border ${
                  formErrors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-sm`}
                placeholder="Create a password"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Creating account...</span>
              ) : (
                <span>Create account</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
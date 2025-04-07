import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/lib/store/auth.store';
import api from '@/services/api';
import type { Course } from '@/lib/schemas';
import { toast } from 'sonner';

export function DashboardPage() {
  const { user, isAuthenticated, logout, setSubscribed } = useAuthStore();
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingUserCourses, setIsLoadingUserCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [userCoursesError, setUserCoursesError] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dashboard: Checking authentication', { isAuthenticated });
    if (!isAuthenticated) {
      console.log('Dashboard: Not authenticated, navigating to login');
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchUserCourses = async () => {
        setIsLoadingUserCourses(true);
        setUserCoursesError(null);
        try {
          const courses = await api.getUserCourses();
          setUserCourses(courses);
        } catch (err) {
          setUserCoursesError(err instanceof Error ? err.message : 'Failed to load your courses');
        } finally {
          setIsLoadingUserCourses(false);
        }
      };
      fetchUserCourses();

      // Fetch all courses only if subscribed
      if (user.subscribed) {
          const fetchAllCourses = async () => {
            setIsLoadingCourses(true);
            setCoursesError(null);
            try {
              const courses = await api.getCourses();
              setAllCourses(courses);
            } catch (err) {
              setCoursesError(err instanceof Error ? err.message : 'Failed to load available courses');
            } finally {
              setIsLoadingCourses(false);
            }
          };
          fetchAllCourses();
      } else {
        // Clear all courses if user becomes unsubscribed
        setAllCourses([]);
      }
    }
  }, [isAuthenticated, user?.subscribed, user]);

  const handleLogout = async () => {
    // Show toast notification for logout
    toast.success('Logged out successfully', {
      description: 'See you again soon!',
    });
    
    // Clear local state via Zustand
    logout();
    // Navigation happens via the useEffect checking isAuthenticated
  };

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    setSubscribeError(null);
    try {
      const updatedUser = await api.subscribe();
      setSubscribed(updatedUser.subscribed); 
      console.log('Subscription successful');
      toast.success('Subscription successful!', {
        description: 'You now have access to all courses.',
      });
    } catch (error) {
      console.error('Subscription failed:', error);
      setSubscribeError(error instanceof Error ? error.message : 'Subscription failed');
      toast.error('Subscription failed', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourseId(courseId);
    setEnrollError(null);
    try {
      await api.enrollCourse(courseId);
      // Refetch user's courses to show the newly enrolled one
      const updatedUserCourses = await api.getUserCourses();
      setUserCourses(updatedUserCourses);
      console.log('Enrollment successful for', courseId);
      toast.success('Successfully enrolled!', {
        description: 'The course has been added to your enrolled courses.',
      });
    } catch (error) {
      console.error('Enrollment failed:', error);
      setEnrollError(error instanceof Error ? error.message : 'Enrollment failed');
      toast.error('Enrollment failed', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Checking authentication...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
        {/* Add a manual navigation option */}
        <button 
          onClick={() => navigate({ to: '/' })}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  if (!user) { 
     return <div className="min-h-screen flex items-center justify-center">Error: User data missing.</div>; 
  }

  const isDataLoading = isLoadingCourses || isLoadingUserCourses;
  const combinedError = coursesError || userCoursesError || subscribeError || enrollError;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">CourseHub</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex space-x-2">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">

              {/* Global Error Display */}            
              {combinedError && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                    <p className="font-bold">An Error Occurred</p>
                    <p>{combinedError}</p>
                  </div>
              )}

              {/* Subscription Prompt */}
              {!user.subscribed && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded" role="alert">
                  <p className="font-bold">Subscription Required</p>
                  <p>You need an active subscription to enroll in courses and view course materials.</p>
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {isSubscribing ? 'Subscribing...' : 'Subscribe Now (Free Trial)'}
                  </button>
                  {subscribeError && <p className="text-red-600 text-sm mt-1">{subscribeError}</p>} 
                </div>
              )}

              {/* Loading State */}
              {isDataLoading && <p className="text-center text-gray-500 py-4">Loading courses...</p>}

              {/* My Courses */} 
              <div className="rounded-lg p-6 bg-white shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">My Enrolled Courses</h2>
                {!isLoadingUserCourses && userCoursesError && <p className="text-red-600">Error: {userCoursesError}</p>} 
                {!isLoadingUserCourses && !userCoursesError && userCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userCourses.map((course) => (
                      <div key={course._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="h-32 bg-indigo-100 rounded mb-3"></div>
                        <h3 className="font-medium">{course.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isLoadingUserCourses && !userCoursesError && <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                )}
                 {isLoadingUserCourses && <p className="text-gray-500">Loading your courses...</p>} 
              </div>

              {/* Browse Courses (requires subscription) */}
              {user.subscribed && (
                <div className="rounded-lg p-6 bg-white shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Browse & Enroll</h2>
                  {!isLoadingCourses && coursesError && <p className="text-red-600">Error: {coursesError}</p>} 
                  {!isLoadingCourses && !coursesError && allCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allCourses.map((course) => {
                          const isEnrolled = userCourses?.some(uc => uc._id === course._id);
                          const isEnrollingThis = enrollingCourseId === course._id;
                          return (
                            <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col">
                              <div className="h-40 bg-indigo-100 rounded mb-4"></div>
                              <h3 className="font-medium">{course.name}</h3>
                              <p className="text-sm text-gray-500 mt-1 flex-grow line-clamp-3">{course.description}</p>
                              {/* Display enroll error specific to this course? */} 
                              {enrollError && enrollingCourseId === course._id && 
                                <p className="text-red-600 text-sm mt-1">Error: {enrollError}</p>} 
                              <div className="mt-4">
                                <button
                                  onClick={() => handleEnroll(course._id)}
                                  disabled={isEnrolled || !!enrollingCourseId} // Disable if enrolled or ANY enroll is in progress
                                  className={`w-full text-sm font-medium rounded px-3 py-2 transition-colors ${
                                    isEnrolled
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50'
                                  }`}
                                >
                                  {isEnrolled ? 'Enrolled' : isEnrollingThis ? 'Enrolling...' : 'Enroll Now'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                  ) : (
                    !isLoadingCourses && !coursesError && <p className="text-center text-gray-500 mt-6">No courses available to enroll.</p>
                  )}
                  {isLoadingCourses && <p className="text-gray-500">Loading available courses...</p>} 
                </div>
              )}
              {!user.subscribed && (
                 <p className="text-center text-gray-500 mt-6">Subscribe to view and enroll in courses.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
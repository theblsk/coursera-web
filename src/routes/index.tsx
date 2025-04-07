import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { LoginPage } from '@/pages/Login.page';
import { DashboardPage } from '@/pages/Dashboard.page';
import { SignupPage } from '@/pages/Signup.page';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  signupRoute,
  dashboardRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
} 
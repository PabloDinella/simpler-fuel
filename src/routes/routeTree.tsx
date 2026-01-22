import { createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { getAuthState } from '../lib/auth';
import Login from './login';
import Dashboard from './dashboard';
import AddEntry from './add';
import Settings from './settings';

// Root route
export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  )
});

// Login route (optional - can access app without it)
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login
});

// Main app routes (no auth required)
export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard
});

export const addRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add',
  component: AddEntry
});

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings
});

// Build route tree
export const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  addRoute,
  settingsRoute
]);

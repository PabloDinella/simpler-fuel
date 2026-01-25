import { createRootRoute, createRoute, Outlet, Link } from '@tanstack/react-router';
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
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
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

import { createRouter as createTanStackRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from '../routes/routeTree';

const router = createTanStackRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export { router, RouterProvider };

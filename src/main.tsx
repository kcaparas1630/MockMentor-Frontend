/**
 * @fileoverview Application entry point that initializes React, routing, and global providers for the AI Interview Frontend.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as the application bootstrap that sets up React with StrictMode, configures TanStack Router
 * for client-side routing, initializes React Query for server state management, and provides the MediaDevicesContext
 * for camera/microphone access throughout the application. It plays a crucial role in establishing the application's
 * core infrastructure and global state management.
 *
 * @see {@link src/App.tsx}
 * @see {@link src/Context/MediaDevicesContext.tsx}
 * @see {@link src/routeTree.gen.ts}
 *
 * Dependencies:
 * - React
 * - React DOM
 * - TanStack Router
 * - TanStack React Query
 * - MediaDevicesProvider
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import the generated  route tree
import { routeTree } from './routeTree.gen'
import { MediaDevicesProvider } from './Context/MediaDevicesContext'
import { CalibrationProvider } from './Context/CalibrationContext.tsx'

/**
 * Query client instance for managing server state and caching.
 * @constant {QueryClient} queryClient - Configured React Query client for API data management.
 */
const queryClient = new QueryClient();

/**
 * Router instance for client-side navigation and routing.
 * @constant {Router} router - Configured TanStack Router with generated route tree.
 */
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

/**
 * Initializes and renders the React application with all necessary providers and configurations.
 *
 * @function
 * @returns {void} Renders the application to the DOM.
 * @example
 * // This function is called automatically when the script loads:
 * createRoot(document.getElementById('root')!).render(...)
 *
 * @throws {Error} Throws if the 'root' element is not found in the DOM.
 * @remarks
 * Side Effects: 
 * - Renders the React application to the DOM
 * - Initializes global providers and context
 * - Sets up routing and query client
 *
 * Known Issues/Limitations:
 * - Assumes 'root' element exists in index.html
 * - No error boundary at the root level
 *
 * Design Decisions/Rationale:
 * - Uses StrictMode for development debugging and future React features
 * - Wraps app in QueryClientProvider for server state management
 * - Provides MediaDevicesContext globally for camera/microphone access
 * - Uses TanStack Router for type-safe routing
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MediaDevicesProvider>
        <CalibrationProvider>
          <RouterProvider router={router} />
        </CalibrationProvider>
      </MediaDevicesProvider>
    </QueryClientProvider>
  </StrictMode>,
)

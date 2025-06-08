import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import the generated  route tree
import { routeTree } from './routeTree.gen'
import { MediaDevicesProvider } from './Context/MediaDevicesContext'

const queryClient = new QueryClient();
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MediaDevicesProvider>
        <RouterProvider router={router} />
      </MediaDevicesProvider>
    </QueryClientProvider>
  </StrictMode>,
)

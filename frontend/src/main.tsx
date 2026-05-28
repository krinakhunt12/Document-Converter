import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom'
import App from './App.tsx'
import ToolsPage from './pages/ToolsPage'
import FeaturesPage from './pages/FeaturesPage'
import FAQPage from './pages/FAQPage'
import { ErrorBoundary, ErrorFallback } from './components/ErrorBoundary.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

// Adapt React Router v6 navigation errors to work seamlessly with our premium ErrorFallback screen
function RouteErrorFallback() {
  const error = useRouteError() as any
  const normalizedError = error instanceof Error
    ? error
    : new Error(
        typeof error === 'string'
          ? error
          : error?.statusText || error?.message || JSON.stringify(error) || 'Route or resource not found'
      )
  
  return (
    <ErrorFallback
      error={normalizedError}
      resetErrorBoundary={() => {
        window.location.href = '/'
      }}
    />
  )
}

const router = createBrowserRouter(
  [
    { path: '/', element: <App />, errorElement: <RouteErrorFallback /> },
    { path: '/tools', element: <ToolsPage />, errorElement: <RouteErrorFallback /> },
    { path: '/features', element: <FeaturesPage />, errorElement: <RouteErrorFallback /> },
    { path: '/faq', element: <FAQPage />, errorElement: <RouteErrorFallback /> },
  ],
  {
    future: {
      // v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)

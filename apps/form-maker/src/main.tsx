import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/atoms'
import { AppCrashScreen } from './components/organisms'

const rootElement = document.getElementById('root')
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary fallback={(message) => <AppCrashScreen message={message} />}>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

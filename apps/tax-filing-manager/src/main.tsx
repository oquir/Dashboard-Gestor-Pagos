import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/atoms'
import { ErrorFallback } from './components/organisms'

// La red de último recurso: lo que falle fuera de una página (el login, el menú, la barra superior) no deja la pantalla
// en blanco. Lo que falla dentro de una página lo atrapa antes la frontera de Layout, que deja el menú a la mano.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={(message) => <ErrorFallback message={message} fullScreen />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

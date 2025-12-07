import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Races from './pages/Races'
import Classes from './pages/Classes'
import Spells from './pages/Spells'
import Characters from './pages/Characters'
import CharacterSheet from './pages/CharacterSheet'
import Admin from './pages/Admin'
import App from './App'
import MainLayout from './components/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AuthRequiredRoute from './components/AuthRequiredRoute'
import ErrorBoundary from './components/ErrorBoundary'
import ToastContainer from './components/ToastContainer'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import KeycloakInitializer from './KeycloakInitializer'
import { queryClient } from './config/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <KeycloakInitializer>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <BrowserRouter>
              <AuthProvider>
              <ToastContainer />
              <MainLayout>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/races" element={<AuthRequiredRoute><Races /></AuthRequiredRoute>} />
                  <Route path="/classes" element={<AuthRequiredRoute><Classes /></AuthRequiredRoute>} />
                  <Route path="/spells" element={<AuthRequiredRoute><Spells /></AuthRequiredRoute>} />
                  <Route path="/characters" element={<AuthRequiredRoute><Characters /></AuthRequiredRoute>} />
                  <Route path="/character-sheet" element={<AuthRequiredRoute><CharacterSheet /></AuthRequiredRoute>} />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Admin />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </AuthProvider>
          </BrowserRouter>
        </ToastProvider>
        </QueryClientProvider>
      </KeycloakInitializer>
    </ErrorBoundary>
  </StrictMode>,
)

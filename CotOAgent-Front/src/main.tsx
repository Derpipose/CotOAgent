import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import Races from './pages/Races'
import Classes from './pages/Classes'
import Spells from './pages/Spells'
import CharacterSheet from './pages/CharacterSheet'
import Admin from './pages/Admin'
import App from './App'
import SideNavBar from './NavBar/SideNavBar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import './css/protected-route.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SideNavBar />
        <div style={{ marginLeft: '250px' }}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/races" element={<Races />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/spells" element={<Spells />} />
            <Route path="/character-sheet" element={<CharacterSheet />} />
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
        </div>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

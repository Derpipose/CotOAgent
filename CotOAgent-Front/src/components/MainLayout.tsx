import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import type { ReactNode } from 'react'
import ChatBar from '../ChatBar/ChatBar'

interface LayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const showChatBar = location.pathname === '/characters'
  const [isChatbarCollapsed, setIsChatbarCollapsed] = useState(false)

  const getMargins = () => {
    if (!showChatBar) {
      // Desktop: account for side navbar
      if (window.innerWidth > 768) {
        return { marginLeft: '250px', marginRight: '0', marginBottom: '0', marginTop: '0' }
      }
      // Mobile: navbar is at top
      return { marginLeft: '0', marginRight: '0', marginBottom: '0', marginTop: '60px' }
    }
    
    // Responsive margins matching chatbar breakpoints
    if (window.innerWidth <= 480) {
      // On mobile, reduce bottom margin if chatbar is collapsed
      const bottomMargin = isChatbarCollapsed ? '60px' : '50vh'
      return { marginLeft: '0', marginRight: '0', marginBottom: bottomMargin, marginTop: '60px' } // Extra top margin on mobile for chatbar page
    } else if (window.innerWidth <= 768) {
      return { marginLeft: '0', marginRight: '50%', marginBottom: '0', marginTop: '0' } // 50% on tablets
    } else if (window.innerWidth <= 1024) {
      return { marginLeft: '250px', marginRight: '40%', marginBottom: '0', marginTop: '0' } // 40% on small desktops
    }
    // Large desktop: chat bar max-width is 600px, so account for that
    return { marginLeft: '250px', marginRight: '600px', marginBottom: '0', marginTop: '0' }
  }

  return (
    <div style={getMargins()}>
      {showChatBar && <ChatBar onCollapsedChange={setIsChatbarCollapsed} />}
      {children}
    </div>
  )
}

export default MainLayout

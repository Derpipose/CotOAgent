import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import ChatBar from '../ChatBar/ChatBar'

interface LayoutProps {
  children: ReactNode
}

const MainLayout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const showChatBar = location.pathname === '/characters'

  return (
    <div style={{ marginLeft: '250px', marginRight: showChatBar ? '350px' : '0' }}>
      {showChatBar && <ChatBar />}
      {children}
    </div>
  )
}

export default MainLayout

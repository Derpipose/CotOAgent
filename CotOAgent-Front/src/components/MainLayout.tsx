import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useState } from "react";
import ChatBar from "../ChatBar/ChatBar";
import SideNavBar from "../pages/SideNavBar";

interface LayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const showChatBar = location.pathname === "/characters";
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (  
    <div className="main-layout-container">
      <SideNavBar />
      <div className="main-layout-content">
        <div className="main-layout-page">
          <div className="main-layout-page-inner">
            <div className="container-max-width">
              {children}
            </div>
          </div>
        </div>
        
        {/* Desktop ChatBar */}
        {showChatBar && (
          <div className="main-layout-chatbar-desktop">
            <ChatBar />
          </div>
        )}
      </div>

      {/* Mobile ChatBar - Always mounted to preserve state, but hidden */}
      {showChatBar && (
        <>
          {/* Chat Toggle Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="main-layout-chat-toggle"
            aria-label="Toggle chat"
          >
            💬
          </button>

          {/* Chat Modal Overlay */}
          {isChatOpen && (
            <div className="main-layout-modal-overlay" />
          )}

          {/* Chat Modal - Always mounted, visibility controlled by opacity */}
          <div
            className={`main-layout-modal ${
              isChatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="main-layout-modal-content">
              <button
                onClick={() => setIsChatOpen(false)}
                className="main-layout-modal-close-button"
                aria-label="Close chat"
              >
                ✕
              </button>
              <div className="main-layout-modal-inner">
                <ChatBar />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainLayout;

import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useState } from "react";
import ChatBar from "../ChatBar/ChatBar";
import SideNavBar from "../NavBar/SideNavBar";

interface LayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const showChatBar = location.pathname === "/characters";
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (  
    <div className="flex flex-col h-screen w-screen lg:flex-row">
      <SideNavBar />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 overflow-auto">{children}</div>
        
        {/* Desktop ChatBar */}
        {showChatBar && (
          <div className="hidden lg:flex w-[400px] h-full border-l border-gray-700 bg-slate-800 flex-col overflow-hidden">
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
            className="lg:hidden fixed bottom-6 right-6 z-40 btn-primary-gradient w-14 h-14 flex-center rounded-full shadow-lg"
            aria-label="Toggle chat"
          >
            💬
          </button>

          {/* Chat Modal Overlay */}
          {isChatOpen && (
            <div className="lg:hidden modal-overlay" />
          )}

          {/* Chat Modal - Always mounted, visibility controlled by opacity */}
          <div
            className={`lg:hidden fixed inset-0 z-50 flex flex-col justify-end transition-opacity duration-300 ${
              isChatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="modal-content rounded-t-lg h-[80vh] flex flex-col relative">
              <button
                onClick={() => setIsChatOpen(false)}
                className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
                aria-label="Close chat"
              >
                ✕
              </button>
              <div className="flex-1 overflow-hidden flex flex-col">
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

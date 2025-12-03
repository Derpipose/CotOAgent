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
            <ChatBar onCollapsedChange={() => {}} />
          </div>
        )}
      </div>

      {/* Mobile ChatBar Toggle Button */}
      {showChatBar && (
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors duration-200"
          aria-label="Toggle chat"
        >
          💬
        </button>
      )}

      {/* Mobile ChatBar Modal */}
      {showChatBar && isChatOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex flex-col">
          <div className="bg-slate-800 rounded-t-lg shadow-xl flex-1 flex flex-col relative">
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors"
              aria-label="Close chat"
            >
              ✕
            </button>
            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatBar onCollapsedChange={() => {}} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;

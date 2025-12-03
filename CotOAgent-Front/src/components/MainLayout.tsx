import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import ChatBar from "../ChatBar/ChatBar";
import "./mainLayout.css";
import SideNavBar from "../NavBar/SideNavBar";

interface LayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const showChatBar = location.pathname === "/characters";

  return (  
    <div
      className={`main-layout `}
    >
      <SideNavBar />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>

      {showChatBar && (
        <div style={{ width: "400px" }}>
          <ChatBar onCollapsedChange={() => {}} />
        </div>
      )}
    </div>
  );
};

export default MainLayout;

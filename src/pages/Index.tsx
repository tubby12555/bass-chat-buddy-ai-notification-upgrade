
import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import ChatContainer from "@/components/chat/ChatContainer";

interface IndexProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const Index = ({ isAuthenticated, setIsAuthenticated }: IndexProps) => {
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-chat">
      {isAuthenticated ? (
        <ChatContainer onLogout={handleLogout} />
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      )}
    </div>
  );
};

export default Index;

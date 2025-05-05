import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import ChatContainer from "@/components/chat/ChatContainer";
import ImagesPage from "@/pages/ImagesPage";
import { Routes, Route } from "react-router-dom";

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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/images" element={<ImagesPage />} />
    </Routes>
  );
};

export default Index;

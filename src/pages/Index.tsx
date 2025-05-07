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
      {/* Empty state for new users */}
      {isAuthenticated && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-6 py-4 rounded-xl shadow-lg z-50 text-center max-w-md">
          <div className="text-xl font-bold mb-2">Welcome to BassProChat!</div>
          <div className="text-gray-300 mb-2">You haven't added any content or generated images yet.</div>
          <div className="text-gray-400">Try adding a YouTube URL in the Content tab or generate your first image in the Images tab.</div>
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

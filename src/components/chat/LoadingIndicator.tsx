
import React from "react";

const LoadingIndicator = () => {
  return (
    <div className="flex items-center">
      <div className="flex items-center justify-center space-x-1 px-2">
        <div className="w-2 h-2 rounded-full bg-chat-highlight animate-pulse-dot-1"></div>
        <div className="w-2 h-2 rounded-full bg-chat-highlight animate-pulse-dot-2"></div>
        <div className="w-2 h-2 rounded-full bg-chat-highlight animate-pulse-dot-3"></div>
      </div>
      <span className="ml-2 text-sm text-gray-400 italic">Thinking...</span>
    </div>
  );
};

export default LoadingIndicator;

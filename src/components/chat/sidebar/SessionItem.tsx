
import React from "react";

interface SessionItemProps {
  id: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const SessionItem = ({ id, title, isActive, onClick }: SessionItemProps) => {
  return (
    <button
      key={id}
      onClick={onClick}
      className={`w-full text-left p-3 my-1 rounded-md text-sm transition-colors ${
        isActive 
          ? "bg-chat-assistant text-white"
          : "text-chat-accent/80 hover:bg-chat-assistant/50"
      }`}
    >
      {title.substring(0, 25)}{title.length > 25 ? "..." : ""}
    </button>
  );
};

export default SessionItem;

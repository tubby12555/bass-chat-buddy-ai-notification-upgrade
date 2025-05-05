
import React from "react";
import MessageList from "./window/MessageList";
import ChatInput from "./window/ChatInput";
import { ModelType } from "@/types/chat";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  modelType: ModelType;
}

const ChatWindow = ({ messages, onSendMessage, isLoading, modelType }: ChatWindowProps) => {
  return (
    <div className="flex-1 flex flex-col max-h-[calc(100vh-48px)]">
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        modelType={modelType} 
      />
      
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ChatWindow;

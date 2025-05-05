
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "../MessageBubble";
import LoadingIndicator from "../LoadingIndicator";
import BassLogo from "../../shared/BassLogo";
import { ModelType } from "@/types/chat";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  modelType: ModelType;
}

const MessageList = ({ messages, isLoading, modelType }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id}
            message={message}
            modelType={modelType}
          />
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 max-w-3xl animate-fade-in">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <BassLogo className="w-full h-full" />
            </div>
            <div className="bg-chat-assistant p-3 rounded-lg text-white">
              <LoadingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default MessageList;

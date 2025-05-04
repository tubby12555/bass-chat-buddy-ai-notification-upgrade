
import React from "react";
import { User } from "lucide-react";
import BassLogo from "../shared/BassLogo";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (message.role === "system") {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="bg-chat-assistant/50 text-chat-accent px-4 py-2 rounded-md text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex items-start gap-3 justify-end max-w-3xl animate-fade-in">
        <div className="bg-chat-user p-3 rounded-lg text-white">
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs text-gray-400 mt-1 text-right">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-chat-assistant overflow-hidden flex-shrink-0 flex items-center justify-center">
          <User className="h-5 w-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-3xl animate-fade-in">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        <BassLogo className="w-full h-full" />
      </div>
      <div className="bg-chat-assistant p-3 rounded-lg text-white">
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs text-gray-400 mt-1">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;


import React from "react";
import { format } from "date-fns";
import BassLogo from "../shared/BassLogo";
import { ModelType } from "@/types/chat";
import { Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface MessageBubbleProps {
  message: Message;
  modelType?: ModelType;
}

const MessageBubble = ({ message, modelType = "qwen" }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  // Function to render markdown-like content with basic formatting
  const renderContent = (content: string) => {
    // Replace markdown links [text](url) with HTML links
    const withLinks = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-chat-highlight underline">$1</a>');
    
    // Replace markdown bold **text** with HTML strong tags
    const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Replace markdown italic *text* with HTML em tags
    const withItalic = withBold.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Replace markdown code blocks ```code``` with HTML pre tags
    const withCodeBlocks = withItalic.replace(/```([^`]+)```/g, '<pre class="bg-black/20 p-3 my-2 rounded-md overflow-auto text-sm">$1</pre>');
    
    // Replace markdown inline code `code` with HTML code tags
    const withInlineCode = withCodeBlocks.replace(/`([^`]+)`/g, '<code class="bg-black/20 px-1 rounded">$1</code>');

    // Replace newlines with HTML line breaks
    const withLineBreaks = withInlineCode.replace(/\n/g, '<br>');
    
    return { __html: withLineBreaks };
  };

  return (
    <div 
      className={`flex items-start gap-3 max-w-3xl animate-fade-in ${
        isUser ? "ml-auto flex-row-reverse" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-chat-accent/10">
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <BassLogo className="w-8 h-8" />
        )}
      </div>
      
      <div 
        className={`p-3 rounded-lg max-w-[80%] ${
          isUser 
            ? "bg-chat-accent text-white" 
            : isSystem 
              ? "bg-gray-700/40 text-gray-300"
              : "bg-chat-assistant text-white"
        }`}
      >
        <div 
          className="prose prose-sm prose-invert max-w-none"
          dangerouslySetInnerHTML={renderContent(message.content)}
        />
        
        <div className="text-xs opacity-50 mt-1">
          {format(new Date(message.timestamp), "h:mm a")}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

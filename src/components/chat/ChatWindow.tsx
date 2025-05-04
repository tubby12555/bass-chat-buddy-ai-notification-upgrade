
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import MessageBubble from "./MessageBubble";
import LoadingIndicator from "./LoadingIndicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import BassLogo from "../shared/BassLogo";
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
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    adjustTextareaHeight();
  };

  return (
    <div className="flex-1 flex flex-col max-h-[calc(100vh-48px)]">
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
      
      <form 
        onSubmit={handleSubmit} 
        className="border-t border-chat-assistant p-4"
      >
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[40px] max-h-[150px] bg-chat-assistant text-white resize-none"
            disabled={isLoading}
            rows={1}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-chat-accent hover:bg-chat-accent/80 text-white h-10"
            disabled={isLoading || !inputText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

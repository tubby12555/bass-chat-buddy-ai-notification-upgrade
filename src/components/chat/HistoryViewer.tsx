
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import { format } from "date-fns";

interface HistoryViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: any[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
}

const HistoryViewer = ({
  isOpen,
  onOpenChange,
  sessions,
  currentSessionId,
  onSelectSession
}: HistoryViewerProps) => {
  // Sort sessions by date, newest first
  const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  const handleSelectSession = (id: string) => {
    onSelectSession(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%] max-h-[80vh] bg-chat text-white border-chat-accent">
        <DialogHeader>
          <DialogTitle className="text-chat-highlight">Chat History</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[calc(80vh-8rem)] overflow-hidden">
          <div className="border-r border-chat-assistant p-2">
            <ScrollArea className="h-[calc(80vh-10rem)]">
              <div className="pr-4 space-y-2">
                {sortedSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      session.id === currentSessionId 
                        ? "bg-chat-accent text-white"
                        : "bg-chat-assistant hover:bg-chat-accent/50"
                    }`}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <div className="font-medium truncate">{session.title}</div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(session.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                    <div className="text-xs mt-1 truncate">
                      {session.messages.length - 1} messages
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          <div className="col-span-2">
            <ScrollArea className="h-[calc(80vh-10rem)] w-full">
              <div className="space-y-6 p-4">
                {sessions.find(s => s.id === currentSessionId)?.messages.map(message => (
                  <MessageBubble 
                    key={message.id}
                    message={message}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryViewer;

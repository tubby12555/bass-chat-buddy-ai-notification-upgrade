
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MessageBubble from "./MessageBubble";

interface PwnedChatData {
  id: string;
  user_id: string;
  session_id: string;
  message: string;
  role: "user" | "assistant" | "system";
  metadata: any;
  created_at: string;
}

interface PwnedHistoryViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const PwnedHistoryViewer = ({
  isOpen,
  onOpenChange,
  userId
}: PwnedHistoryViewerProps) => {
  const [sessions, setSessions] = useState<Record<string, PwnedChatData[]>>({});
  const [sessionIds, setSessionIds] = useState<string[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchPwnedChatData();
    }
  }, [isOpen, userId]);

  const fetchPwnedChatData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pwned_chat_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching pwned chat data:", error);
        toast({
          title: "Error",
          description: "Failed to load chat history",
          variant: "destructive"
        });
        return;
      }

      // Group messages by session_id
      const groupedSessions: Record<string, PwnedChatData[]> = {};
      data.forEach(message => {
        if (!groupedSessions[message.session_id]) {
          groupedSessions[message.session_id] = [];
        }
        groupedSessions[message.session_id].push(message);
      });

      setSessions(groupedSessions);
      setSessionIds(Object.keys(groupedSessions));

    } catch (error) {
      console.error("Error processing chat data:", error);
      toast({
        title: "Error",
        description: "Failed to process chat history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySessionToClipboard = (sessionId: string) => {
    const sessionData = sessions[sessionId];
    if (sessionData) {
      const text = sessionData.map(msg => 
        `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.message}`
      ).join('\n\n');
      
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Chat session has been copied to clipboard"
        });
      });
    }
  };

  // If no sessions are available
  const noSessions = sessionIds.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80%] max-h-[80vh] bg-chat text-white border-chat-accent">
        <DialogHeader>
          <DialogTitle className="text-chat-highlight">Pwned Chat History</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-chat-highlight">Loading...</div>
          </div>
        ) : noSessions ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-center text-gray-400">No pwned chat history found.</p>
            <p className="text-center text-gray-400">Try using the pwned model first!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Carousel className="w-full">
              <CarouselContent>
                {sessionIds.map((sessionId, index) => (
                  <CarouselItem key={sessionId}>
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-chat-highlight text-lg">
                          Session {index + 1} - {format(new Date(sessions[sessionId][0]?.created_at || Date.now()), "MMM d, yyyy")}
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copySessionToClipboard(sessionId)}
                          className="text-white hover:bg-chat-accent/20"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>

                      <ScrollArea className="h-[calc(80vh-10rem)] w-full">
                        <div className="space-y-6 p-4">
                          {sessions[sessionId].map((message) => (
                            <MessageBubble 
                              key={message.id}
                              message={{
                                id: message.id,
                                role: message.role,
                                content: message.message,
                                timestamp: new Date(message.created_at).getTime()
                              }}
                              modelType="pwned"
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-chat-accent text-white hover:bg-chat-accent/80" />
              <CarouselNext className="right-2 bg-chat-accent text-white hover:bg-chat-accent/80" />
            </Carousel>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PwnedHistoryViewer;

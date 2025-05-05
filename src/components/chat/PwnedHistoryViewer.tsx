
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ModelType } from "@/types/chat";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Define the type for pwned chat data
interface PwnedChatData {
  id: string;
  user_id: string;
  session_id: string;
  content: string;
  model_type: ModelType;
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
  userId,
}: PwnedHistoryViewerProps) => {
  const [sessions, setSessions] = useState<{ [key: string]: PwnedChatData[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchPwnedChatData();
    }
  }, [isOpen, userId]);

  const fetchPwnedChatData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pwned_chat_data")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching pwned chat data:", error);
        toast({
          title: "Error",
          description: "Failed to load pwned chat history",
          variant: "destructive",
        });
        return;
      }

      // Group data by session_id
      const sessionMap: { [key: string]: PwnedChatData[] } = {};
      
      if (data) {
        data.forEach((item) => {
          // Type assertion to ensure model_type is of type ModelType
          const chatData: PwnedChatData = {
            ...item,
            model_type: item.model_type as ModelType
          };

          if (!sessionMap[item.session_id]) {
            sessionMap[item.session_id] = [];
          }
          sessionMap[item.session_id].push(chatData);
        });
      }

      setSessions(sessionMap);
    } catch (error) {
      console.error("Error in fetch function:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySessionContent = (sessionId: string) => {
    const sessionData = sessions[sessionId];
    if (!sessionData || sessionData.length === 0) return;

    const content = sessionData.map((item) => item.content).join("\n\n");
    navigator.clipboard.writeText(content);

    toast({
      title: "Copied to clipboard",
      description: "The session content has been copied to your clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto bg-chat-sidebar text-white">
        <DialogHeader>
          <DialogTitle className="text-chat-highlight">Pwned Chat History</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-chat-assistant/50" />
            <Skeleton className="h-60 w-full bg-chat-assistant/50" />
            <Skeleton className="h-12 w-full bg-chat-assistant/50" />
          </div>
        ) : Object.keys(sessions).length > 0 ? (
          <Carousel>
            <CarouselContent>
              {Object.entries(sessions).map(([sessionId, data]) => (
                <CarouselItem key={sessionId}>
                  <div className="p-4 border border-chat-assistant rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-chat-highlight">
                        Session: {sessionId.substring(0, 8)}...
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copySessionContent(sessionId)}
                        className="bg-transparent border-chat-accent text-chat-highlight hover:bg-chat-accent/20"
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {data.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-chat-assistant/30 rounded border-l-2 border-chat-accent"
                        >
                          <p className="text-sm opacity-70 mb-1">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                          <p className="whitespace-pre-wrap">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-4">
              <CarouselPrevious className="static bg-chat-accent/60 hover:bg-chat-accent" />
              <CarouselNext className="static bg-chat-accent/60 hover:bg-chat-accent" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center py-8">
            <p>No pwned chat history found.</p>
            <p className="text-sm text-gray-400 mt-2">
              Pwned chats will appear here after you use the pwned model.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PwnedHistoryViewer;


import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ModelType } from "@/types/chat";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import MessageBubble from "./MessageBubble";
import { v4 as uuidv4 } from "uuid";

interface PwnedChatData {
  id: string;
  user_id: string;
  session_id: string;
  content: string;
  model_type?: ModelType;
  created_at: string; // Ensure this is always defined in our interface
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
  const [chatData, setChatData] = useState<PwnedChatData[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchSessions();
    }
  }, [isOpen, userId]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pwned_chat_data')
        .select('session_id')
        .eq('user_id', userId)
        .eq('model_type', 'pwned')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique session IDs
      const uniqueSessions = [...new Set(data.map(item => item.session_id))];
      setSessions(uniqueSessions);
      
      if (uniqueSessions.length > 0) {
        setSelectedSession(uniqueSessions[0]);
        await fetchSessionData(uniqueSessions[0]);
      }
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionData = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pwned_chat_data')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Make sure all objects have all the required properties
      const processedData = data.map(item => ({
        ...item,
        id: item.id || uuidv4(),
        created_at: item.created_at || new Date().toISOString(),
        model_type: item.model_type || "pwned"
      })) as PwnedChatData[];

      setChatData(processedData);
      setSelectedSession(sessionId);
    } catch (error: any) {
      console.error("Error fetching session data:", error);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!selectedSession) return;

    try {
      const { error } = await supabase
        .from('pwned_chat_data')
        .delete()
        .eq('session_id', selectedSession)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat history cleared",
      });
      
      // Refresh sessions
      fetchSessions();
    } catch (error: any) {
      console.error("Error clearing history:", error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-chat text-white border-chat-accent">
        <DialogHeader>
          <DialogTitle className="text-chat-highlight">Pwned Model Conversation History</DialogTitle>
        </DialogHeader>
        
        {sessions.length === 0 ? (
          <div className="p-4 text-center">
            <p>No pwned model conversation history found.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {sessions.map(sessionId => (
                  <Button
                    key={sessionId}
                    variant={selectedSession === sessionId ? "default" : "outline"}
                    className={selectedSession === sessionId ? "bg-chat-highlight" : "bg-transparent"}
                    onClick={() => fetchSessionData(sessionId)}
                    size="sm"
                  >
                    {sessionId.substring(0, 8)}
                  </Button>
                ))}
              </div>
              
              {selectedSession && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearHistory}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
              {chatData.map((item) => (
                <MessageBubble
                  key={item.id}
                  message={{
                    id: item.id,
                    role: item.user_id === userId ? "user" : "assistant",
                    content: item.content,
                    timestamp: new Date(item.created_at).getTime()
                  }}
                  modelType={item.model_type || "qwen"}
                />
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PwnedHistoryViewer;

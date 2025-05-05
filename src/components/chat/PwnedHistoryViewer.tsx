
import React from "react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { formatDistanceToNow } from "date-fns";
import { ModelType } from "@/types/chat";

interface PwnedChatData {
  id: string;
  model_type: string;
  content: string;
  session_id: string;
  user_id: string;
  created_at: string;
}

interface PwnedHistoryViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const PwnedHistoryViewer = ({ isOpen, onOpenChange, userId }: PwnedHistoryViewerProps) => {
  const [pwnedData, setPwnedData] = useState<PwnedChatData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPwnedData = async () => {
      if (!isOpen || !userId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('pwned_chat_data')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          // Transform the data if necessary
          const transformedData = data.map((item: any) => ({
            id: item.id,
            model_type: item.model_type || "unknown",
            content: item.content,
            session_id: item.session_id,
            user_id: item.user_id,
            created_at: item.created_at || new Date().toISOString()
          }));
          
          setPwnedData(transformedData);
        }
      } catch (err) {
        console.error('Error fetching pwned chat data:', err);
        setError('Failed to load pwned chat data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPwnedData();
  }, [isOpen, userId]);

  const renderMessages = () => {
    if (isLoading) return <div className="p-4 text-center">Loading...</div>;
    if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
    if (pwnedData.length === 0) return <div className="p-4 text-center">No pwned chat data found</div>;

    return pwnedData.map((item) => (
      <div key={item.id} className="border-b border-gray-700 mb-4 pb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <div>
            Model: {item.model_type || "Unknown"}
          </div>
          <div>
            {item.created_at && formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </div>
        </div>
        <MessageBubble 
          message={{ 
            role: "assistant", 
            content: item.content
          }}
          modelType={item.model_type as ModelType || "assistant"}
        />
      </div>
    ));
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black text-white">
        <DrawerHeader>
          <div className="flex justify-between items-center">
            <DrawerTitle className="text-white">Pwned Chat History</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {renderMessages()}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PwnedHistoryViewer;


import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PwnedHistoryViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

// TypeScript interface for our data structure
interface PwnedItem {
  id: string;
  content: string;
  user_id: string;
  session_id: string;
  model_type: string;
  created_at?: string; // Make created_at optional
}

const PwnedHistoryViewer = ({ isOpen, onOpenChange, userId }: PwnedHistoryViewerProps) => {
  const [history, setHistory] = useState<PwnedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, userId]);

  const loadHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pwned_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Ensure all items have a created_at property
      const processedData = (data || []).map(item => ({
        ...item,
        created_at: item.created_at || new Date().toISOString()
      }));
      
      setHistory(processedData);
    } catch (error) {
      console.error('Error loading pwned history:', error);
      toast({
        title: "Error",
        description: "Could not load history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Group items by session_id
  const groupedHistory = history.reduce((acc, item) => {
    if (!acc[item.session_id]) {
      acc[item.session_id] = [];
    }
    acc[item.session_id].push(item);
    return acc;
  }, {} as Record<string, PwnedItem[]>);

  // Convert to array and sort by most recent
  const sessions = Object.entries(groupedHistory)
    .map(([sessionId, items]) => ({
      sessionId,
      items,
      // Find the most recent item in the session
      lastActivity: new Date(
        Math.max(...items.map(item => new Date(item.created_at || 0).getTime()))
      )
    }))
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pwned History</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="sessions">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <p>Loading history...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex items-center justify-center h-80">
                <p>No pwned history found</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                {sessions.map(session => (
                  <div key={session.sessionId} className="mb-6">
                    <h3 className="text-lg font-medium mb-2">
                      Session {session.sessionId.substring(0, 8)}...
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        {formatDate(session.lastActivity)}
                      </span>
                    </h3>
                    
                    {session.items.map(item => (
                      <div key={item.id} className="rounded-md border p-3 mb-3">
                        <p className="whitespace-pre-wrap text-sm">{item.content}</p>
                      </div>
                    ))}
                    
                    <Separator />
                  </div>
                ))}
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="queries" className="min-h-[400px]">
            <div className="flex items-center justify-center h-80">
              <p>SQL query history will be shown here</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PwnedHistoryViewer;

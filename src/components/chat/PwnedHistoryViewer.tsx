import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PwnedHistoryViewerProps {
  userId: string;
  onSelectSession: (sessionId: string, content: string) => void;
  currentSessionId: string | null;
}

interface PwnedChatData {
  id: string;
  user_id: string;
  content: string;
  session_id: string;
  model_type: string | null;
  created_at?: string; // Make created_at optional
}

const PwnedHistoryViewer: React.FC<PwnedHistoryViewerProps> = ({
  userId,
  onSelectSession,
  currentSessionId,
}) => {
  const [sessions, setSessions] = useState<Record<string, PwnedChatData[]>>({});
  const [loading, setLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    const fetchSessions = async (reset = false) => {
      setLoading(true);
      try {
        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data, error } = await supabase
          .from("pwned_chat_data")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) {
          console.error("Error fetching sessions:", error);
          return;
        }
        // Group by session_id
        const groupedSessions: Record<string, PwnedChatData[]> = {};
        data.forEach((item: PwnedChatData) => {
          if (!groupedSessions[item.session_id]) {
            groupedSessions[item.session_id] = [];
          }
          groupedSessions[item.session_id].push(item);
        });
        setSessions(prev => reset ? groupedSessions : { ...prev, ...groupedSessions });
      } finally {
        setLoading(false);
      }
    };
    // Only fetch sessions for authenticated users (not 'anonymous')
    if (!userId || userId === 'anonymous') {
      setSessions({});
      return;
    }
    setSessions({});
    setPage(0);
    fetchSessions(true);
  }, [userId, page]);

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      const { error } = await supabase
        .from("pwned_chat_data")
        .delete()
        .eq("session_id", sessionToDelete);

      if (error) {
        console.error("Error deleting session:", error);
        return;
      }

      // Remove session from state
      const newSessions = { ...sessions };
      delete newSessions[sessionToDelete];
      setSessions(newSessions);

      // If the deleted session was the current one, reset
      if (sessionToDelete === currentSessionId) {
        onSelectSession("", "");
      }
    } finally {
      setSessionToDelete(null);
    }
  };

  const getSessionPreview = (sessionData: PwnedChatData[]) => {
    const firstMessage = sessionData[0]?.content || "Empty session";
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
  };

  const getSessionTime = (sessionData: PwnedChatData[]) => {
    // Use optional chaining to handle missing created_at
    const timestamp = sessionData[0]?.created_at;
    if (!timestamp) return "Unknown time";
    
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Add Load More button
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading) {
    // Only show loading if we expect sessions to load
    return null;
  }

  const sessionIds = Object.keys(sessions);
  if (sessionIds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pb-4">
      {sessionIds.map((sessionId) => (
        <div
          key={sessionId}
          className={`p-3 rounded cursor-pointer text-sm transition-colors ${
            sessionId === currentSessionId
              ? "bg-chat-accent/40 text-white"
              : "hover:bg-chat-accent/20 text-gray-300"
          }`}
        >
          <div
            className="flex justify-between items-start"
            onClick={() => onSelectSession(sessionId, sessions[sessionId][0]?.content || "")}
          >
            <div>
              <div className="font-medium">{getSessionPreview(sessions[sessionId])}</div>
              <div className="text-xs text-gray-400 mt-1">{getSessionTime(sessions[sessionId])}</div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full opacity-60 hover:opacity-100 hover:bg-red-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSessionToDelete(sessionId);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this session? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSession}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
      {sessionIds.length % PAGE_SIZE === 0 && sessionIds.length > 0 && (
        <div className="flex justify-center mt-4">
          <button className="px-4 py-2 bg-chat-accent text-white rounded" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PwnedHistoryViewer;

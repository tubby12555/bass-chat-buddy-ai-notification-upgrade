
import React from "react";
import ContentSection from "@/components/chat/ContentSection";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ContentPage: React.FC = () => {
  // Get userId from Supabase auth
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        setUserId(data?.user?.id || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getUser();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-chat text-white">Loading...</div>;
  }

  if (!userId) {
    return <div className="flex items-center justify-center h-screen bg-chat text-white">Please log in to access content.</div>;
  }

  return (
    <div className="min-h-screen bg-chat p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Content Organizer</h1>
        <a href="/" className="text-chat-highlight underline">Back to Chat</a>
      </div>
      
      <div className="bg-chat-assistant rounded-lg p-4 mb-6">
        <ContentSection userId={userId} />
      </div>
    </div>
  );
};

export default ContentPage;

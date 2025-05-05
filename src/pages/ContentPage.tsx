import React from "react";
import ContentSection from "@/components/chat/ContentSection";
import { supabase } from "@/integrations/supabase/client";

const ContentPage: React.FC = () => {
  // Get userId from Supabase auth
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    };
    getUser();
  }, []);

  if (!userId) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-chat p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Content Organizer</h1>
        <a href="/" className="text-chat-highlight underline">Back to Chat</a>
      </div>
      <ContentSection userId={userId} />
      {/* Future: Add notes, ideas, and more content types here */}
    </div>
  );
};

export default ContentPage; 
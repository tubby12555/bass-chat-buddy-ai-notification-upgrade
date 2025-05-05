
import React from "react";
import ImageGallery from "@/components/gallery/ImageGallery";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ImagesPage: React.FC = () => {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

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
    return (
      <div className="flex items-center justify-center h-screen bg-chat">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-chat gap-6">
        <div className="text-white text-xl text-center max-w-md">
          Please log in to access your image gallery.
        </div>
        <Button onClick={() => navigate("/")} variant="outline">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chat p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Image Gallery</h1>
          <Button 
            variant="ghost" 
            className="text-white hover:text-chat-highlight flex items-center gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={16} />
            Back to Chat
          </Button>
        </div>
        
        <div className="bg-chat-assistant/20 rounded-lg p-4 mb-6">
          <ImageGallery userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default ImagesPage;

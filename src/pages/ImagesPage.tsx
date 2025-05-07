
import React from "react";
import ImageGallery from "@/components/gallery/ImageGallery";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image, Images } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ImagesPage: React.FC = () => {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
      <div className="flex items-center justify-center h-screen bg-chat text-white w-full max-w-full">
        <div className="flex flex-col items-center animate-pulse">
          <svg className="animate-spin w-12 h-12 text-chat-highlight mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-chat text-white w-full max-w-full p-4 gap-4">
        <div className="glass-panel p-8 rounded-xl max-w-md text-center">
          <Image size={48} className="mx-auto mb-4 text-chat-highlight" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-300 mb-6">Please log in to access your image gallery.</p>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-gradient-to-r from-chat-accent to-chat-highlight hover:opacity-90 text-white"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chat p-3 sm:p-6 w-full max-w-full page-transition">
      <div className="glass-panel rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 w-full max-w-full">
          <div className="flex items-center gap-3">
            <Images className="text-chat-highlight h-8 w-8" />
            <h1 className="text-3xl font-bold text-white">Your Gallery</h1>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            className="bg-black/30 border-chat-accent/40 hover:bg-chat-highlight/20 text-white hover-glow"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
          </Button>
        </div>
        
        <div className="w-full max-w-full">
          <ImageGallery userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default ImagesPage;

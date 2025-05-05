
import React from "react";
import ImageGallery from "@/components/gallery/ImageGallery";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { logEventToSupabase } from "@/utils/loggingUtils";

const ImagesPage: React.FC = () => {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);
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

  const handleProcessImages = async () => {
    if (!userId) return;
    
    setIsProcessing(true);
    try {
      // Log event
      await logEventToSupabase(userId, 'manual_process_images', {});
      
      const { error } = await supabase.functions.invoke('image-processor');
      
      if (error) {
        console.error("Error calling image processor:", error);
        toast({
          title: "Processing Error",
          description: "There was an issue processing images. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Images Processed",
          description: "Your images have been processed successfully.",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleProcessImages}
              disabled={isProcessing}
              className="text-white flex items-center gap-2"
            >
              <RefreshCw size={16} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? "Processing..." : "Process Images"}
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:text-chat-highlight flex items-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={16} />
              Back to Chat
            </Button>
          </div>
        </div>
        
        <div className="bg-chat-assistant/20 rounded-lg p-4 mb-6">
          <ImageGallery userId={userId} />
        </div>
      </div>
    </div>
  );
};

export default ImagesPage;

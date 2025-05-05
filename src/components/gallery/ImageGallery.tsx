
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ImageFilter from "./ImageFilter";
import ImageGrid from "./ImageGrid";
import ImageDetailsModal from "./ImageDetailsModal";
import { logEventToSupabase } from "@/utils/loggingUtils";

interface ContentImage {
  id: string;
  user_id: string;
  permanent_url: string | null;
  content_type: string | null;
  prompt: string | null;
  style: string | null;
  blog: string | null;
  created_at: string;
}

interface ImageGalleryProps {
  userId: string;
}

const TABS = ["all", "flux", "gpt4.1image"];

const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  return !!url && url.includes('.supabase.co/storage/');
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ userId }) => {
  const [images, setImages] = useState<ContentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingImages, setProcessingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ContentImage | null>(null);
  const [tab, setTab] = useState<string>("all");
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_images")
        .select("id, user_id, permanent_url, content_type, prompt, style, blog, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching images:", error);
        toast({
          title: "Error",
          description: "Failed to load images. Please try again.",
          variant: "destructive"
        });
      } else if (data) {
        // Filter out images with invalid permanent_url
        const validImages = data.filter(img => isValidSupabaseUrl(img.permanent_url));
        setImages(validImages as ContentImage[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Check for pending images that need processing
  const checkPendingImages = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from("content_images")
        .select("id", { count: 'exact', head: true })
        .eq("user_id", userId)
        .is("permanent_url", null)
        .not("temp_url", "is", null);
      
      if (!error && count && count > 0) {
        return count;
      }
      return 0;
    } catch (err) {
      console.error("Error checking pending images:", err);
      return 0;
    }
  }, [userId]);

  // Process pending images automatically via the edge function
  const processImages = useCallback(async () => {
    const pendingCount = await checkPendingImages();
    
    if (pendingCount === 0) return;
    
    setProcessingImages(true);
    try {
      // Log event
      await logEventToSupabase(userId, 'process_images', { count: pendingCount });
      
      // Call the edge function to process images
      const { error } = await supabase.functions.invoke('image-processor');
      
      if (error) {
        console.error("Error calling image processor:", error);
        toast({
          title: "Processing Error",
          description: "There was an issue processing some images. Please try again later.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Images Processed",
          description: "Your images have been processed successfully.",
        });
        // Refresh the image list
        fetchImages();
      }
    } catch (err) {
      console.error("Unexpected error during image processing:", err);
    } finally {
      setProcessingImages(false);
    }
  }, [checkPendingImages, fetchImages, toast, userId]);

  useEffect(() => {
    if (userId) {
      fetchImages();
      // Automatically process images when component mounts
      processImages(); 
    }
  }, [userId, fetchImages, processImages]);

  // Set up a subscription for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('content-images-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_images',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log("Real-time update received", payload);
          // When changes are detected, refresh the image list and check for pending images
          fetchImages();
          processImages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchImages, processImages]);

  const filteredImages = tab === "all" 
    ? images 
    : images.filter(img => img.content_type === tab);

  return (
    <div className="p-2">
      <ImageFilter
        tab={tab}
        setTab={setTab}
        tabs={TABS}
        loading={loading || processingImages}
        filteredImages={filteredImages}
      />
      
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-white flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing images...
          </div>
        </div>
      )}
      
      {!loading && filteredImages.length > 0 && (
        <ImageGrid 
          images={filteredImages}
          onSelectImage={setSelectedImage}
        />
      )}
      
      {!loading && filteredImages.length === 0 && (
        <div className="text-white p-8 text-center bg-chat-assistant/30 rounded-lg">
          <p className="text-xl font-medium mb-2">No images found</p>
          <p className="text-gray-400">
            {tab === "all" 
              ? "You haven't generated any images yet." 
              : `You haven't generated any ${tab} images yet.`}
          </p>
        </div>
      )}
      
      <ImageDetailsModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};

export default ImageGallery;

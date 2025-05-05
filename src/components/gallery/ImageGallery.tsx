
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ImageFilter from "./ImageFilter";
import ImageGrid from "./ImageGrid";
import ImageDetailsModal from "./ImageDetailsModal";

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
  }, [checkPendingImages, fetchImages, toast]);

  useEffect(() => {
    if (userId) {
      fetchImages();
      processImages(); // Automatically process images when component mounts
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
        () => {
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
      
      {!loading && filteredImages.length > 0 && (
        <ImageGrid 
          images={filteredImages}
          onSelectImage={setSelectedImage}
        />
      )}
      
      <ImageDetailsModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};

export default ImageGallery;

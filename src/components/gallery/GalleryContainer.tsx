
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ImageFilter from "./ImageFilter";
import ImageGrid from "./ImageGrid";
import ImageDetailsModal from "./ImageDetailsModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getImageUrl } from "@/utils/imageUrlUtils";
import GalleryContent from "./GalleryContent";
import EnlargedImageModal from "./EnlargedImageModal";

interface ContentImage {
  id: string;
  user_id: string;
  permanent_url: string | null;
  temp_url: string | null;
  content_type: string | null;
  prompt: string | null;
  style: string | null;
  blog: string | null;
  created_at: string;
}

interface GalleryContainerProps {
  userId: string;
}

const GalleryContainer: React.FC<GalleryContainerProps> = ({ userId }) => {
  const [images, setImages] = useState<ContentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ContentImage | null>(null);
  const [tab, setTab] = useState<string>("all");
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const [enlargedImage, setEnlargedImage] = useState<ContentImage | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Public fetchImages function for external refresh
  const fetchImages = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      console.log(`Fetching images for user ${userId}`);
      const from = reset ? 0 : page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("content_images")
        .select("id, user_id, permanent_url, content_type, prompt, style, blog, created_at, temp_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error("Error fetching images:", error);
        toast({
          title: "Error",
          description: "Failed to load images. Please try again.",
          variant: "destructive"
        });
      } else if (data) {
        const validImages = data.filter(img => 
          getImageUrl(img) !== null
        );
        console.log(`Fetched images: ${data.length}`);
        console.log(`Valid images: ${validImages.length}`);
        setImages(prev => reset ? validImages : [...prev, ...validImages]);
      }
    } catch (err) {
      console.error("Unexpected error fetching images:", err);
    } finally {
      setLoading(false);
      setRealtimeLoading(false);
    }
  }, [userId, toast, page]);

  // Initial fetch and refresh
  useEffect(() => {
    if (userId) {
      if (fetchTrigger === 0) {
        setImages([]);
        setPage(0);
      }
      fetchImages(fetchTrigger === 0);
    }
  }, [userId, fetchImages, fetchTrigger]);

  // Trigger processing of temp_urls
  useEffect(() => {
    const processImages = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('image-processor', {});
        console.log(data);
        
        if (data && data.results && data.results.some(r => r.success)) {
          // If any images were successfully processed, trigger a refresh
          setTimeout(() => {
            setFetchTrigger(prev => prev + 1);
          }, 2000);
        }
      } catch (err) {
        console.error("Error processing images:", err);
      }
    };
    
    if (userId) {
      processImages();
    }
  }, [userId]);

  // Real-time subscription for content_images
  useEffect(() => {
    if (!userId) return;
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
          setRealtimeLoading(true);
          setFetchTrigger(prev => prev + 1);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const filteredImages = tab === "all" 
    ? images 
    : images.filter(img => img.content_type === tab);

  console.log("Rendering with filtered images:", filteredImages.length);
  console.log("Current tab:", tab);
  console.log("Loading state:", loading);
  console.log("Processing state:", realtimeLoading);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="p-2 relative glass-panel rounded-lg">
      {realtimeLoading && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 px-4 py-2 rounded-full shadow-lg text-white flex items-center gap-2 animate-pulse">
          <svg className="animate-spin h-5 w-5 text-chat-highlight" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Updating images...
        </div>
      )}
      <ImageFilter
        tab={tab}
        setTab={setTab}
        tabs={["all", "flux", "gpt4.1image"]}
        loading={loading}
        filteredImages={filteredImages}
      />
      
      <GalleryContent 
        loading={loading}
        filteredImages={filteredImages}
        onSelectImage={setSelectedImage}
        onDeleteImage={handleDeleteImage}
        onEnlargeImage={setEnlargedImage}
        onLoadMore={handleLoadMore}
        hasMoreImages={images.length % PAGE_SIZE === 0 && images.length > 0}
      />
      
      <ImageDetailsModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
      
      <EnlargedImageModal 
        enlargedImage={enlargedImage} 
        onClose={() => setEnlargedImage(null)} 
      />
    </div>
  );
};

export default GalleryContainer;

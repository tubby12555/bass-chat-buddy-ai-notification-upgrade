
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ImageFilter from "./ImageFilter";
import ImageGrid from "./ImageGrid";
import ImageDetailsModal from "./ImageDetailsModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { logEventToSupabase } from "@/utils/loggingUtils";

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

interface ImageGalleryProps {
  userId: string;
}

const TABS = ["all", "flux", "gpt4.1image"];

const isValidImageUrl = (url: string | null | undefined) => {
  return (
    (!!url && url.includes('.supabase.co/storage/')) ||
    (!!url && url.startsWith('https://drive.google.com/'))
  );
};

const getImageUrl = (image: ContentImage) => {
  if (image.permanent_url && image.permanent_url.includes('.supabase.co/storage/')) return image.permanent_url;
  if (image.temp_url && image.temp_url.startsWith('https://drive.google.com/')) {
    // Convert Google Drive view URL to direct image URL if needed
    if (image.temp_url.includes('view?usp=sharing')) {
      return image.temp_url.replace('view?usp=sharing', 'preview');
    }
    return image.temp_url;
  }
  return null;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ userId }) => {
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
          isValidImageUrl(img.permanent_url) || isValidImageUrl(img.temp_url)
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
        tabs={TABS}
        loading={loading}
        filteredImages={filteredImages}
      />
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-white flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-chat-highlight mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg">Loading your gallery...</p>
          </div>
        </div>
      )}
      {!loading && filteredImages.length > 0 && (
        <ImageGrid 
          images={filteredImages}
          onSelectImage={setSelectedImage}
          onDelete={handleDeleteImage}
          onEnlarge={setEnlargedImage}
        />
      )}
      {!loading && filteredImages.length === 0 && (
        <div className="text-white p-12 text-center bg-chat-assistant/30 rounded-xl backdrop-blur-sm border border-white/5 shadow-lg">
          <p className="text-2xl font-medium mb-3">No images found</p>
          <p className="text-gray-300 max-w-md mx-auto">
            {tab === "all" 
              ? "You haven't generated any images yet. Try creating some with the image generation tools!" 
              : `You haven't generated any ${tab} images yet. Try using the ${tab} image generator.`}
          </p>
        </div>
      )}
      {images.length % PAGE_SIZE === 0 && images.length > 0 && (
        <div className="flex justify-center mt-8">
          <button 
            className="px-6 py-3 bg-gradient-to-r from-chat-accent to-chat-highlight text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" 
            onClick={handleLoadMore} 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : "Load More Images"}
          </button>
        </div>
      )}
      <ImageDetailsModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
      
      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
          <DialogContent className="w-full max-w-full sm:max-w-4xl h-auto max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black to-gray-900 border border-chat-highlight p-2 sm:p-6 shadow-xl shadow-chat-highlight/20">
            <DialogHeader>
              <DialogTitle className="text-white text-xl flex items-center gap-2">
                <span className="text-chat-highlight">Image Preview</span>
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center p-2">
                <img 
                  src={getImageUrl(enlargedImage) || ""} 
                  alt={enlargedImage.prompt || "Image"} 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                    e.currentTarget.classList.add("w-24", "h-24", "opacity-20");
                  }}
                />
              </div>
              <div className="text-white text-sm space-y-2">
                {enlargedImage.prompt && (
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="font-semibold text-sm text-chat-highlight mb-1">Prompt</p>
                    <p>{enlargedImage.prompt}</p>
                  </div>
                )}
                {enlargedImage.style && (
                  <div className="bg-black/30 rounded-lg p-4">
                    <p className="font-semibold text-sm text-chat-highlight mb-1">Style</p>
                    <p>{enlargedImage.style}</p>
                  </div>
                )}
                <div className="bg-black/30 rounded-lg p-4">
                  <p className="font-semibold text-sm text-chat-highlight mb-1">Type</p>
                  <p>{enlargedImage.content_type || "uncategorized"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ImageGallery;

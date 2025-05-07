
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

interface GalleryContextProps {
  images: ContentImage[];
  loading: boolean;
  realtimeLoading: boolean;
  selectedImage: ContentImage | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<ContentImage | null>>;
  enlargedImage: ContentImage | null;
  setEnlargedImage: React.Dispatch<React.SetStateAction<ContentImage | null>>;
  tab: string;
  setTab: React.Dispatch<React.SetStateAction<string>>;
  filteredImages: ContentImage[];
  fetchImages: (reset?: boolean) => Promise<void>;
  handleLoadMore: () => void;
  handleDeleteImage: (id: string) => void;
  hasMoreImages: boolean;
}

interface GalleryProviderProps {
  userId: string;
  children: React.ReactNode;
}

const GalleryContext = createContext<GalleryContextProps | undefined>(undefined);

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
};

export const GalleryProvider: React.FC<GalleryProviderProps> = ({ userId, children }) => {
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
          img.permanent_url !== null || img.temp_url !== null
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

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const hasMoreImages = images.length % PAGE_SIZE === 0 && images.length > 0;

  return (
    <GalleryContext.Provider
      value={{
        images,
        loading,
        realtimeLoading,
        selectedImage,
        setSelectedImage,
        enlargedImage,
        setEnlargedImage,
        tab,
        setTab,
        filteredImages,
        fetchImages,
        handleLoadMore,
        handleDeleteImage,
        hasMoreImages
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

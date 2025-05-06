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
  const [selectedImage, setSelectedImage] = useState<ContentImage | null>(null);
  const [tab, setTab] = useState<string>("all");
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const fetchImages = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("content_images")
        .select("id, user_id, permanent_url, content_type, prompt, style, blog, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load images. Please try again.",
          variant: "destructive"
        });
      } else if (data) {
        const validImages = data.filter(img => isValidSupabaseUrl(img.permanent_url));
        setImages(prev => reset ? validImages : [...prev, ...validImages]);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  }, [userId, toast, page]);

  useEffect(() => {
    if (userId) {
      setImages([]);
      setPage(0);
      fetchImages(true);
    }
  }, [userId, fetchImages]);

  // Real-time subscription: only re-fetch images on change
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
          fetchImages(true);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchImages]);

  const filteredImages = tab === "all" 
    ? images 
    : images.filter(img => img.content_type === tab);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="p-2">
      <ImageFilter
        tab={tab}
        setTab={setTab}
        tabs={TABS}
        loading={loading}
        filteredImages={filteredImages}
      />
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-white flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading images...
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
      {images.length % PAGE_SIZE === 0 && images.length > 0 && (
        <div className="flex justify-center mt-4">
          <button className="px-4 py-2 bg-chat-accent text-white rounded" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
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

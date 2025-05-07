import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ImageFilter from "./ImageFilter";
import ImageGrid from "./ImageGrid";
import ImageDetailsModal from "./ImageDetailsModal";
import { logEventToSupabase } from "@/utils/loggingUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  if (image.temp_url && image.temp_url.startsWith('https://drive.google.com/')) return image.temp_url;
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

  // Public fetchImages function for external refresh
  const fetchImages = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("content_images")
        .select("id, user_id, permanent_url, content_type, prompt, style, blog, created_at, temp_url")
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
        const validImages = data.filter(img => isValidImageUrl(img.permanent_url) || isValidImageUrl(img.temp_url));
        setImages(prev => reset ? validImages : [...prev, ...validImages]);
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
      setRealtimeLoading(false);
    }
  }, [userId, toast, page]);

  useEffect(() => {
    if (userId) {
      setImages([]);
      setPage(0);
      fetchImages(true);
    }
  }, [userId, fetchImages]);

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

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="p-2 relative">
      {realtimeLoading && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 px-4 py-2 rounded shadow text-white flex items-center gap-2 animate-pulse">
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
          onDelete={handleDeleteImage}
          onEnlarge={setEnlargedImage}
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
      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <Dialog open={!!enlargedImage} onOpenChange={() => setEnlargedImage(null)}>
          <DialogContent className="w-full max-w-full sm:max-w-3xl h-auto max-h-[90vh] overflow-y-auto bg-black border-chat-highlight p-2 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-white">Image Preview</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <img src={getImageUrl(enlargedImage) || ""} alt={enlargedImage.prompt || "Image"} className="w-full max-h-[60vh] object-contain rounded-lg bg-black" />
              <div className="text-white text-sm break-words">
                <div><span className="font-semibold">Prompt:</span> {enlargedImage.prompt || <span className="text-gray-400">None</span>}</div>
                {enlargedImage.style && <div><span className="font-semibold">Style:</span> {enlargedImage.style}</div>}
                <div><span className="font-semibold">Type:</span> {enlargedImage.content_type || "uncategorized"}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ImageGallery;

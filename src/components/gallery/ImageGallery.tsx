
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ImageUploadManager from "./ImageUploadManager";
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

  useEffect(() => {
    if (userId) fetchImages();
  }, [userId, fetchImages]);

  const filteredImages = tab === "all" 
    ? images 
    : images.filter(img => img.content_type === tab);

  return (
    <div className="p-2">
      <ImageUploadManager userId={userId} onUploadComplete={fetchImages} />
      
      <ImageFilter
        tab={tab}
        setTab={setTab}
        tabs={TABS}
        loading={loading}
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

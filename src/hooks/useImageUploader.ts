
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ImageUploadResult {
  success: boolean;
  publicUrl: string | null;
  error?: string;
}

export const useImageUploader = () => {
  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // Function to move an image from temp URL to permanent storage
  const moveImageToPermanentStorage = async (
    imageId: string,
    userId: string,
    tempUrl: string,
    filename: string = `image-${Date.now()}.png`
  ): Promise<ImageUploadResult> => {
    setIsUploading(prev => ({ ...prev, [imageId]: true }));
    
    try {
      // First try to use the edge function
      const result = await callEdgeFunction(imageId, userId, tempUrl, filename);
      if (result.success) {
        setIsUploading(prev => ({ ...prev, [imageId]: false }));
        return result;
      }
      
      // If edge function fails, fall back to client-side upload
      return await clientSideUpload(imageId, userId, tempUrl, filename);
    } catch (error) {
      console.error("Error in image upload:", error);
      setIsUploading(prev => ({ ...prev, [imageId]: false }));
      
      return {
        success: false,
        publicUrl: null,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  // Try to use the edge function first (more secure)
  const callEdgeFunction = async (
    imageId: string,
    userId: string,
    tempUrl: string,
    filename: string
  ): Promise<ImageUploadResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('image-upload', {
        body: {
          table: 'content_images',
          id: imageId,
          userId,
          tempUrl,
          filename
        }
      });

      if (error) throw error;
      
      return {
        success: true,
        publicUrl: data.publicUrl
      };
    } catch (error) {
      console.warn("Edge function failed, falling back to client-side upload:", error);
      return {
        success: false,
        publicUrl: null,
        error: "Edge function failed"
      };
    }
  };

  // Client-side fallback for image upload
  const clientSideUpload = async (
    imageId: string,
    userId: string,
    tempUrl: string,
    filename: string
  ): Promise<ImageUploadResult> => {
    try {
      // Fetch the image
      const response = await fetch(tempUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const storagePath = `${userId}/${imageId}/${filename}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_images')
        .upload(storagePath, blob, {
          contentType: blob.type,
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('user_images')
        .getPublicUrl(storagePath);
        
      const publicUrl = publicUrlData?.publicUrl;
      
      // Update database
      const { error: updateError } = await supabase
        .from('content_images')
        .update({
          permanent_url: publicUrl,
          bucket: 'user_images',
          path: storagePath,
          temp_url: null
        })
        .eq('id', imageId);
      
      if (updateError) {
        throw updateError;
      }
      
      setIsUploading(prev => ({ ...prev, [imageId]: false }));
      return {
        success: true,
        publicUrl
      };
    } catch (error) {
      console.error("Client-side upload failed:", error);
      setIsUploading(prev => ({ ...prev, [imageId]: false }));
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      
      return {
        success: false,
        publicUrl: null,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };

  return {
    moveImageToPermanentStorage,
    isUploading
  };
};

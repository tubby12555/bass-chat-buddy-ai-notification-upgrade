
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useImageUploader } from "@/hooks/useImageUploader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

interface PendingImage {
  id: string;
  temp_url: string;
  user_id: string;
}

interface ImageUploadManagerProps {
  userId: string;
  onUploadComplete?: () => void;
}

const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({ userId, onUploadComplete }) => {
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadResults, setUploadResults] = useState<Record<string, boolean>>({});
  const { moveImageToPermanentStorage, isUploading } = useImageUploader();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingImages();
  }, [userId]);

  const fetchPendingImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("content_images")
        .select("id, temp_url, user_id")
        .eq("user_id", userId)
        .is("permanent_url", null)
        .not("temp_url", "is", null);
      
      if (error) throw error;
      setPendingImages(data || []);
    } catch (err) {
      console.error("Error fetching pending images:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAll = async () => {
    if (pendingImages.length === 0) return;
    
    let successCount = 0;
    for (const image of pendingImages) {
      const result = await moveImageToPermanentStorage(
        image.id,
        image.user_id,
        image.temp_url,
        `image-${image.id}.png`
      );
      
      setUploadResults(prev => ({
        ...prev,
        [image.id]: result.success
      }));
      
      if (result.success) successCount++;
    }
    
    if (successCount > 0) {
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${successCount} of ${pendingImages.length} images.`,
        variant: "default",
      });
      
      // Refresh the list after uploads
      setTimeout(() => {
        fetchPendingImages();
        if (onUploadComplete) onUploadComplete();
      }, 1000);
    }
  };

  const handleUploadSingle = async (image: PendingImage) => {
    const result = await moveImageToPermanentStorage(
      image.id,
      image.user_id,
      image.temp_url,
      `image-${image.id}.png`
    );
    
    setUploadResults(prev => ({
      ...prev,
      [image.id]: result.success
    }));
    
    if (result.success) {
      toast({
        title: "Upload Complete",
        description: "Image successfully uploaded to permanent storage.",
        variant: "default",
      });
      
      // Refresh the list after upload
      setTimeout(() => {
        fetchPendingImages();
        if (onUploadComplete) onUploadComplete();
      }, 1000);
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Checking for pending uploads...</div>;
  }

  if (pendingImages.length === 0) {
    return null; // No pending images, don't show anything
  }

  return (
    <div className="bg-chat-assistant/40 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-medium">
          Pending Image Uploads ({pendingImages.length})
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleUploadAll}
          disabled={Object.values(isUploading).some(v => v)}
          className="text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Process All
        </Button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {pendingImages.map(image => (
          <div key={image.id} className="flex items-center justify-between bg-black/20 rounded-md p-2">
            <div className="flex items-center gap-2">
              {uploadResults[image.id] === true && (
                <CheckCircle className="text-green-500 h-4 w-4" />
              )}
              {uploadResults[image.id] === false && (
                <AlertCircle className="text-red-500 h-4 w-4" />
              )}
              <span className="text-sm text-white truncate max-w-[180px]">
                Image {image.id.substring(0, 8)}...
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUploadSingle(image)}
              disabled={isUploading[image.id]}
              className="text-white"
            >
              {isUploading[image.id] ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Process"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploadManager;

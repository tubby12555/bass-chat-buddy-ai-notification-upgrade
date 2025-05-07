
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "lucide-react";
import { useImageState } from "@/hooks/useImageState";
import { getImageUrl } from "@/utils/imageUrlUtils";
import ImageDisplay from "./ImageDisplay";
import ImageMetadata from "./ImageMetadata";
import ImageActions from "./ImageActions";

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

interface ImageDetailsModalProps {
  selectedImage: ContentImage | null;
  setSelectedImage: (image: ContentImage | null) => void;
}

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({ 
  selectedImage, 
  setSelectedImage 
}) => {
  const { imageLoaded, imageError, handleImageLoad, handleImageError } = useImageState(selectedImage);
  
  if (!selectedImage) return null;

  const imageUrl = getImageUrl(selectedImage);

  return (
    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
      <DialogContent className="w-full max-w-4xl h-auto max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black to-gray-900 border border-chat-highlight/50 p-6 shadow-xl shadow-chat-highlight/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Image size={20} className="text-chat-highlight" />
            Image Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
          <div className="md:w-1/2">
            <ImageDisplay 
              image={selectedImage} 
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
              imageLoaded={imageLoaded}
              imageError={imageError}
            />
          </div>
          
          <div className="md:w-1/2 text-white break-words flex flex-col">
            <ImageMetadata image={selectedImage} />
            <ImageActions imageUrl={imageUrl} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailsModal;

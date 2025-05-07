import React from "react";
import { Image } from "lucide-react";
import { getImageUrl } from "@/utils/imageUrlUtils";

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

interface ImageDisplayProps {
  image: ContentImage;
  onImageLoad: () => void;
  onImageError: () => void;
  imageLoaded: boolean;
  imageError: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  image,
  onImageLoad,
  onImageError,
  imageLoaded,
  imageError
}) => {
  const imageUrl = getImageUrl(image);

  if (!imageUrl) {
    return (
      <div className="w-full h-60 flex items-center justify-center bg-black/50 text-gray-400 rounded-lg">
        <div className="flex flex-col items-center">
          <Image size={48} className="mb-4 opacity-30" />
          <p className="mt-2">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-black/50 flex items-center justify-center border border-white/5 shadow-inner">
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-chat-highlight/30 border-t-chat-highlight rounded-full animate-spin"></div>
        </div>
      )}
      
      <img 
        src={imageUrl} 
        alt={image.prompt || "Generated image"} 
        loading="lazy"
        aria-label="Gallery image"
        className={`w-full h-auto max-h-[50vh] object-contain transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onLoad={onImageLoad}
        onError={onImageError}
      />
      
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-black/70 p-4">
          <Image size={48} className="mb-4 opacity-30" />
          <p className="text-center">Failed to load image</p>
          <p className="text-center text-xs mt-2 max-w-xs text-gray-500">
            The image URL might be invalid or the image might have been deleted
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;


import React from "react";
import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";

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

interface ImageCardProps {
  image: ContentImage;
  onClick: () => void;
}

const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  return !!url && url.includes('.supabase.co/storage/');
};

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    console.error(`Failed to load image: ${image.permanent_url}`);
  };

  return (
    <Card 
      key={image.id} 
      className="bg-chat-assistant rounded-lg shadow-lg cursor-pointer overflow-hidden transition-transform hover:scale-[1.02]" 
      onClick={onClick}
    >
      <div className="aspect-square relative">
        {isValidSupabaseUrl(image.permanent_url) ? (
          <>
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="animate-pulse">
                  <Image size={32} className="text-gray-600" />
                </div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <Image size={32} className="text-gray-600" />
              </div>
            )}
            
            <img 
              src={image.permanent_url!} 
              alt={image.prompt || "Generated image"} 
              className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
            <Image size={32} />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm text-white font-medium line-clamp-2 h-10">
          {image.prompt || "No prompt"}
        </div>
        <div className="mt-2 flex justify-between items-center">
          <span className="text-xs px-2 py-1 bg-chat-highlight/20 rounded-full text-chat-highlight">
            {image.content_type || "uncategorized"}
          </span>
          {image.style && (
            <span className="text-xs text-gray-400">{image.style}</span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ImageCard;

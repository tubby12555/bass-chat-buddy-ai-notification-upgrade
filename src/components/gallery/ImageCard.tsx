import React from "react";
import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  onDelete?: (id: string) => void;
}

const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  return !!url && url.includes('.supabase.co/storage/');
};

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, onDelete }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const { toast } = useToast();

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    console.error(`Failed to load image: ${image.permanent_url}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this image?")) return;
    setDeleting(true);
    const { error } = await supabase
      .from("content_images")
      .delete()
      .eq("id", image.id);
    setDeleting(false);
    if (!error) {
      toast({ title: "Deleted", description: "Image deleted.", variant: "default" });
      if (onDelete) onDelete(image.id);
    } else {
      toast({ title: "Error", description: "Failed to delete image.", variant: "destructive" });
    }
  };

  return (
    <Card 
      key={image.id} 
      className="bg-chat-assistant rounded-lg shadow-lg cursor-pointer overflow-hidden transition-transform hover:scale-[1.02] relative" 
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
        {onDelete && (
          <button
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 z-10"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete image"
          >
            {deleting ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </button>
        )}
      </div>
    </Card>
  );
};

export default ImageCard;

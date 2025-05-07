
import React from "react";
import { Card } from "@/components/ui/card";
import { Image } from "lucide-react";
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

interface ImageCardProps {
  image: ContentImage;
  onClick: () => void;
  onDelete?: (id: string) => void;
  onEnlarge?: () => void;
}

const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  return !!url && url.includes('.supabase.co/storage/');
};

const getImageUrl = (image: ContentImage) => {
  if (image.permanent_url && image.permanent_url.includes('.supabase.co/storage/')) return image.permanent_url;
  if (image.temp_url && image.temp_url.startsWith('https://drive.google.com/')) {
    // Convert Google Drive view URL to direct image URL if needed
    if (image.temp_url.includes('view?usp=sharing')) {
      return image.temp_url.replace('view?usp=sharing', 'preview');
    }
    return image.temp_url;
  }
  return null;
};

const ImageCard: React.FC<ImageCardProps> = ({ image, onClick, onDelete, onEnlarge }) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const { toast } = useToast();

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
    console.error(`Failed to load image: ${image.permanent_url || image.temp_url}`);
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

  const imageUrl = getImageUrl(image);

  return (
    <Card 
      key={image.id} 
      className="bg-chat-assistant/20 backdrop-blur-sm rounded-xl shadow-lg cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] relative w-full max-w-full border border-white/5 group"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-square relative w-full max-w-full overflow-hidden">
        {onEnlarge && (
          <button
            className="absolute top-2 left-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 flex items-center justify-center z-10 focus:outline-none focus:ring-2 focus:ring-chat-highlight focus:ring-offset-2 w-9 h-9 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); onEnlarge(); }}
            title="Enlarge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L10 14m-7 7h6m0 0v-6m0 6L14 10" />
            </svg>
          </button>
        )}
        
        {onDelete && (
          <button
            className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white rounded-full p-2 flex items-center justify-center z-10 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 w-9 h-9 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete"
          >
            {deleting ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        )}
        
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1]`}></div>
        
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image.prompt || "Image"}
            className={`w-full h-full object-cover transition-all duration-500 ${hovered ? 'scale-105' : 'scale-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs">No Image</div>
        )}
        
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        )}
        
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4">
            <Image size={24} className="mb-2 opacity-50" />
            <p className="text-center text-xs">Image unavailable</p>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col gap-1 w-full max-w-full relative z-[2]">
        <div className="font-medium text-white text-sm truncate break-words" title={image.prompt || "Image"}>
          {image.prompt || "Image"}
        </div>
        {image.style && <div className="text-xs text-gray-300 truncate">{image.style}</div>}
        <div className="text-xs text-gray-400 truncate">{image.content_type || "uncategorized"}</div>
      </div>
    </Card>
  );
};

export default ImageCard;

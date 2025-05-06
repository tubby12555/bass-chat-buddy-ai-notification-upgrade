import React from "react";
import ImageCard from "./ImageCard";

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

interface ImageGridProps {
  images: ContentImage[];
  onSelectImage: (image: ContentImage) => void;
  onDelete?: (id: string) => void;
  onEnlarge?: (image: ContentImage) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onSelectImage, onDelete, onEnlarge }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map(img => (
        <ImageCard 
          key={img.id} 
          image={img} 
          onClick={() => onSelectImage(img)} 
          onDelete={onDelete}
          onEnlarge={onEnlarge}
        />
      ))}
    </div>
  );
};

export default ImageGrid;

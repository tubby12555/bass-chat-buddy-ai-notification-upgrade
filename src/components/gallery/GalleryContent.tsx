
import React from "react";
import ImageGrid from "./ImageGrid";
import GalleryLoadingState from "./GalleryLoadingState";
import EmptyGalleryState from "./EmptyGalleryState";

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

interface GalleryContentProps {
  loading: boolean;
  filteredImages: ContentImage[];
  onSelectImage: (image: ContentImage) => void;
  onDeleteImage: (id: string) => void;
  onEnlargeImage: (image: ContentImage) => void;
  onLoadMore: () => void;
  hasMoreImages: boolean;
}

const GalleryContent: React.FC<GalleryContentProps> = ({
  loading,
  filteredImages,
  onSelectImage,
  onDeleteImage,
  onEnlargeImage,
  onLoadMore,
  hasMoreImages
}) => {
  if (loading) {
    return <GalleryLoadingState />;
  }

  if (filteredImages.length === 0) {
    return <EmptyGalleryState />;
  }

  return (
    <>
      <ImageGrid 
        images={filteredImages}
        onSelectImage={onSelectImage}
        onDelete={onDeleteImage}
        onEnlarge={onEnlargeImage}
      />
      
      {hasMoreImages && (
        <div className="flex justify-center mt-8">
          <button 
            className="px-6 py-3 bg-gradient-to-r from-chat-accent to-chat-highlight text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" 
            onClick={onLoadMore}
          >
            Load More Images
          </button>
        </div>
      )}
    </>
  );
};

export default GalleryContent;

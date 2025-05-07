
import React from "react";
import ImageFilter from "./ImageFilter";
import ImageDetailsModal from "./ImageDetailsModal";
import GalleryContent from "./GalleryContent";
import EnlargedImageModal from "./EnlargedImageModal";
import { useGallery } from "./GalleryContext";

/**
 * Container component for the image gallery
 * Uses the GalleryContext to access state and actions
 */
const GalleryContainer: React.FC = () => {
  const {
    loading,
    realtimeLoading,
    filteredImages,
    selectedImage,
    setSelectedImage,
    enlargedImage,
    setEnlargedImage,
    tab,
    setTab,
    handleDeleteImage,
    handleLoadMore,
    hasMoreImages
  } = useGallery();

  return (
    <div className="p-2 relative glass-panel rounded-lg">
      {realtimeLoading && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 px-4 py-2 rounded-full shadow-lg text-white flex items-center gap-2 animate-pulse">
          <svg className="animate-spin h-5 w-5 text-chat-highlight" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Updating images...
        </div>
      )}
      
      <ImageFilter 
        tab={tab}
        setTab={setTab}
        tabs={["all", "flux", "gpt4.1image"]}
        loading={loading}
        filteredImages={filteredImages}
      />
      
      <GalleryContent 
        loading={loading}
        filteredImages={filteredImages}
        onSelectImage={setSelectedImage}
        onDeleteImage={handleDeleteImage}
        onEnlargeImage={setEnlargedImage}
        onLoadMore={handleLoadMore}
        hasMoreImages={hasMoreImages}
      />
      
      <ImageDetailsModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
      
      <EnlargedImageModal 
        enlargedImage={enlargedImage} 
        onClose={() => setEnlargedImage(null)} 
      />
    </div>
  );
};

export default GalleryContainer;

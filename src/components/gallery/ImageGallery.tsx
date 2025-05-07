
import React from "react";
import GalleryContainer from "./GalleryContainer";
import { GalleryProvider } from "./GalleryContext";

interface ImageGalleryProps {
  userId: string;
}

/**
 * Main image gallery component that displays user's generated images
 * This component provides context and renders the main gallery container
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({ userId }) => {
  return (
    <GalleryProvider userId={userId}>
      <GalleryContainer />
    </GalleryProvider>
  );
};

export default ImageGallery;

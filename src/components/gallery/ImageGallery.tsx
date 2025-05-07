
import React from "react";
import GalleryContainer from "./GalleryContainer";

interface ImageGalleryProps {
  userId: string;
}

/**
 * Main image gallery component that displays user's generated images
 * This is a wrapper around GalleryContainer that handles the main gallery logic
 */
const ImageGallery: React.FC<ImageGalleryProps> = ({ userId }) => {
  return <GalleryContainer userId={userId} />;
};

export default ImageGallery;

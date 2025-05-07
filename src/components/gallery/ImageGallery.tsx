
import React from "react";
import GalleryContainer from "./GalleryContainer";

interface ImageGalleryProps {
  userId: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ userId }) => {
  return <GalleryContainer userId={userId} />;
};

export default ImageGallery;

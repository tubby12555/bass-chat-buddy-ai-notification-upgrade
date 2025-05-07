
import { useState, useEffect } from 'react';

export const useImageState = (selectedImage: any | null) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset states when the modal opens
  useEffect(() => {
    if (selectedImage) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [selectedImage]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error("Failed to load image:", selectedImage?.permanent_url || selectedImage?.temp_url);
    setImageError(true);
    setImageLoaded(false);
  };

  return {
    imageLoaded,
    imageError,
    handleImageLoad,
    handleImageError
  };
};

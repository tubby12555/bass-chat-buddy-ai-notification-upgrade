
import React from "react";

interface EmptyGalleryStateProps {
  tab?: string;
}

const EmptyGalleryState: React.FC<EmptyGalleryStateProps> = ({ tab = "all" }) => (
  <div className="text-white p-12 text-center bg-chat-assistant/30 rounded-xl backdrop-blur-sm border border-white/5 shadow-lg">
    <p className="text-2xl font-medium mb-3">No images found</p>
    <p className="text-gray-300 max-w-md mx-auto">
      {tab === "all" 
        ? "You haven't generated any images yet. Try creating some with the image generation tools!" 
        : `You haven't generated any ${tab} images yet. Try using the ${tab} image generator.`}
    </p>
  </div>
);

export default EmptyGalleryState;


import React from "react";
import { formatDate } from "@/utils/formatUtils";

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

interface ImageMetadataProps {
  image: ContentImage;
}

const ImageMetadata: React.FC<ImageMetadataProps> = ({ image }) => {
  const createdDate = formatDate(image.created_at);

  return (
    <div className="space-y-4 flex-grow">
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-semibold text-chat-highlight mb-1">Prompt</h3>
        <p className="text-sm">{image.prompt || "None"}</p>
      </div>
      
      {image.style && (
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-chat-highlight mb-1">Style</h3>
          <p className="text-sm">{image.style}</p>
        </div>
      )}
      
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-semibold text-chat-highlight mb-1">Type</h3>
        <p className="text-sm">{image.content_type || "uncategorized"}</p>
        <p className="text-xs text-gray-400 mt-2">Created on {createdDate}</p>
      </div>
      
      {image.content_type === "gpt4.1image" && image.blog && (
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-white/5">
          <h3 className="text-sm font-semibold text-chat-highlight mb-1">Blog</h3>
          <div className="bg-black/40 p-3 rounded text-sm max-h-40 overflow-y-auto whitespace-pre-line scrollbar-thin scrollbar-thumb-chat-accent/40 scrollbar-track-transparent">
            {image.blog}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMetadata;

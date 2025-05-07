
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getImageUrl } from "@/utils/imageUrlUtils";
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

interface EnlargedImageModalProps {
  enlargedImage: ContentImage | null;
  onClose: () => void;
}

const EnlargedImageModal: React.FC<EnlargedImageModalProps> = ({ enlargedImage, onClose }) => {
  if (!enlargedImage) return null;

  const imageUrl = getImageUrl(enlargedImage);
  
  return (
    <Dialog open={!!enlargedImage} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full sm:max-w-4xl h-auto max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black to-gray-900 border border-chat-highlight p-2 sm:p-6 shadow-xl shadow-chat-highlight/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <span className="text-chat-highlight">Image Preview</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="bg-black rounded-lg overflow-hidden flex items-center justify-center p-2">
            <img 
              src={imageUrl || ""} 
              alt={enlargedImage.prompt || "Image"} 
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                e.currentTarget.classList.add("w-24", "h-24", "opacity-20");
              }}
            />
          </div>
          <div className="text-white text-sm space-y-2">
            {enlargedImage.prompt && (
              <div className="bg-black/30 rounded-lg p-4">
                <p className="font-semibold text-sm text-chat-highlight mb-1">Prompt</p>
                <p>{enlargedImage.prompt}</p>
              </div>
            )}
            {enlargedImage.style && (
              <div className="bg-black/30 rounded-lg p-4">
                <p className="font-semibold text-sm text-chat-highlight mb-1">Style</p>
                <p>{enlargedImage.style}</p>
              </div>
            )}
            <div className="bg-black/30 rounded-lg p-4">
              <p className="font-semibold text-sm text-chat-highlight mb-1">Type</p>
              <p>{enlargedImage.content_type || "uncategorized"}</p>
              {enlargedImage.created_at && (
                <p className="text-xs text-gray-400 mt-2">Created on {formatDate(enlargedImage.created_at)}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnlargedImageModal;

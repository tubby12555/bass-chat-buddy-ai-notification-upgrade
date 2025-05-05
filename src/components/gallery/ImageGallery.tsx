import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ContentImage {
  id: string;
  user_id: string;
  permanent_url?: string | null;
  content_type?: string | null;
  prompt?: string | null;
  style?: string | null;
  blog?: string | null;
  created_at?: string;
}

interface ImageGalleryProps {
  userId: string;
}

const TABS = ["all", "flux", "gpt4.1image"];

const isValidSupabaseUrl = (url: string | null | undefined) => {
  return !!url && url.includes('.supabase.co/storage/');
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ userId }) => {
  const [images, setImages] = useState<ContentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ContentImage | null>(null);
  const [tab, setTab] = useState<string>("all");

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_images")
        .select("id, user_id, permanent_url, content_type, prompt, style, blog, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setImages(data as ContentImage[]);
      setLoading(false);
    };
    if (userId) fetchImages();
  }, [userId]);

  const filteredImages = tab === "all" ? images : images.filter(img => img.content_type === tab);

  return (
    <div className="p-2">
      <div className="mb-4 flex gap-2">
        {TABS.map(t => (
          <Button key={t} variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>{t === "all" ? "All" : t.toUpperCase()}</Button>
        ))}
      </div>
      {loading ? (
        <div className="text-white">Loading images...</div>
      ) : filteredImages.length === 0 ? (
        <div className="text-white p-4">No images found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredImages.map(img => (
            <Card key={img.id} className="bg-chat-assistant rounded-lg shadow-lg cursor-pointer overflow-hidden" onClick={() => setSelectedImage(img)}>
              {isValidSupabaseUrl(img.permanent_url) ? (
                <img src={img.permanent_url!} alt={img.prompt || "Image"} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-800 text-gray-400">No Image</div>
              )}
              <div className="p-2 text-xs text-white truncate">{img.prompt || "No prompt"}</div>
              <div className="px-2 pb-2 text-xs text-gray-400 truncate">{img.content_type || "uncategorized"}</div>
            </Card>
          ))}
        </div>
      )}
      {/* Modal for image details */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Image Details</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {isValidSupabaseUrl(selectedImage.permanent_url) ? (
                <img src={selectedImage.permanent_url!} alt={selectedImage.prompt || "Image"} className="w-full rounded-lg object-contain max-h-80 bg-black" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-800 text-gray-400">No Image</div>
              )}
              <div className="text-white text-sm">
                <div><span className="font-semibold">Prompt:</span> {selectedImage.prompt || <span className="text-gray-400">None</span>}</div>
                {selectedImage.style && <div><span className="font-semibold">Style:</span> {selectedImage.style}</div>}
                <div><span className="font-semibold">Type:</span> {selectedImage.content_type || "uncategorized"}</div>
                {selectedImage.content_type === "gpt4.1image" && selectedImage.blog && (
                  <div className="mt-2"><span className="font-semibold">Blog:</span><div className="bg-black/30 p-2 rounded text-xs mt-1 whitespace-pre-line">{selectedImage.blog}</div></div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {isValidSupabaseUrl(selectedImage.permanent_url) && <>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(selectedImage.permanent_url!)}>Copy Image URL</Button>
                  <Button size="sm" variant="outline" onClick={() => window.open(selectedImage.permanent_url!, "_blank")}>Open</Button>
                  <Button size="sm" variant="outline" onClick={() => { const a = document.createElement('a'); a.href = selectedImage.permanent_url!; a.download = 'image.jpg'; a.click(); }}>Download</Button>
                </>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ImageGallery; 
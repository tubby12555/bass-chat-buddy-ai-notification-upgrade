
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, ExternalLink, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ContentImage {
  id: string;
  user_id: string;
  permanent_url: string | null;
  content_type: string | null;
  prompt: string | null;
  style: string | null;
  blog: string | null;
  created_at: string;
}

interface ImageGalleryProps {
  userId: string;
}

const TABS = ["all", "flux", "gpt4.1image"];

const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  return !!url && url.includes('.supabase.co/storage/');
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ userId }) => {
  const [images, setImages] = useState<ContentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ContentImage | null>(null);
  const [tab, setTab] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("content_images")
          .select("id, user_id, permanent_url, content_type, prompt, style, blog, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching images:", error);
          toast({
            title: "Error",
            description: "Failed to load images. Please try again.",
            variant: "destructive"
          });
        } else if (data) {
          // Filter out images with invalid permanent_url
          const validImages = data.filter(img => isValidSupabaseUrl(img.permanent_url));
          setImages(validImages as ContentImage[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) fetchImages();
  }, [userId, toast]);

  const filteredImages = tab === "all" 
    ? images 
    : images.filter(img => img.content_type === tab);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Image URL copied to clipboard",
    });
  };

  const handleDownloadImage = (url: string, filename: string = "image.jpg") => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-2">
      <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4 bg-chat-assistant/50">
          {TABS.map(t => (
            <TabsTrigger key={t} value={t} className="text-white data-[state=active]:bg-chat-highlight data-[state=active]:text-black">
              {t === "all" ? "All Images" : t === "flux" ? "Flux" : "GPT-4.1"}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-white flex items-center">
                <Image className="animate-pulse mr-2" size={24} />
                <span>Loading images...</span>
              </div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-white p-8 text-center bg-chat-assistant/30 rounded-lg">
              <Image className="mx-auto mb-4 opacity-50" size={48} />
              <h3 className="text-xl font-medium mb-2">No images found</h3>
              <p className="text-gray-400">
                {tab === "all" 
                  ? "You haven't generated any images yet." 
                  : `You haven't generated any ${tab} images yet.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map(img => (
                <Card 
                  key={img.id} 
                  className="bg-chat-assistant rounded-lg shadow-lg cursor-pointer overflow-hidden transition-transform hover:scale-[1.02]" 
                  onClick={() => setSelectedImage(img)}
                >
                  <div className="aspect-square relative">
                    {isValidSupabaseUrl(img.permanent_url) ? (
                      <img 
                        src={img.permanent_url!} 
                        alt={img.prompt || "Generated image"} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                        <Image size={32} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm text-white font-medium line-clamp-2 h-10">
                      {img.prompt || "No prompt"}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs px-2 py-1 bg-chat-highlight/20 rounded-full text-chat-highlight">
                        {img.content_type || "uncategorized"}
                      </span>
                      {img.style && (
                        <span className="text-xs text-gray-400">{img.style}</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal for image details */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl bg-chat-assistant border-chat-highlight">
            <DialogHeader>
              <DialogTitle className="text-white">Image Details</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                {isValidSupabaseUrl(selectedImage.permanent_url) ? (
                  <img 
                    src={selectedImage.permanent_url!} 
                    alt={selectedImage.prompt || "Generated image"} 
                    className="w-full rounded-lg object-contain max-h-[70vh] bg-black" 
                  />
                ) : (
                  <div className="w-full h-60 flex items-center justify-center bg-gray-800 text-gray-400 rounded-lg">
                    <Image size={48} />
                  </div>
                )}
              </div>
              <div className="md:w-1/2 text-white">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Prompt</h3>
                    <p className="text-sm">{selectedImage.prompt || "None"}</p>
                  </div>
                  
                  {selectedImage.style && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Style</h3>
                      <p className="text-sm">{selectedImage.style}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-1">Type</h3>
                    <p className="text-sm">{selectedImage.content_type || "uncategorized"}</p>
                  </div>
                  
                  {selectedImage.content_type === "gpt4.1image" && selectedImage.blog && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-1">Blog</h3>
                      <div className="bg-black/30 p-3 rounded text-sm max-h-60 overflow-y-auto whitespace-pre-line">
                        {selectedImage.blog}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {isValidSupabaseUrl(selectedImage.permanent_url) && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => handleCopyUrl(selectedImage.permanent_url!)}
                        >
                          <Copy size={16} /> Copy URL
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => window.open(selectedImage.permanent_url!, "_blank")}
                        >
                          <ExternalLink size={16} /> Open
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleDownloadImage(selectedImage.permanent_url!)}
                        >
                          <Download size={16} /> Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ImageGallery;

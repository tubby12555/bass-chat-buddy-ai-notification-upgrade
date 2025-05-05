
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image } from "lucide-react";

interface ImageFilterProps {
  tab: string;
  setTab: (tab: string) => void;
  tabs: string[];
  loading: boolean;
  filteredImages: any[];
}

const ImageFilter: React.FC<ImageFilterProps> = ({ 
  tab, 
  setTab, 
  tabs, 
  loading, 
  filteredImages 
}) => {
  return (
    <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="mb-4 bg-chat-assistant/50">
        {tabs.map(t => (
          <TabsTrigger 
            key={t} 
            value={t} 
            className="text-white data-[state=active]:bg-chat-highlight data-[state=active]:text-black"
          >
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
          <EmptyImageState tab={tab} />
        ) : null}
      </TabsContent>
    </Tabs>
  );
};

const EmptyImageState: React.FC<{ tab: string }> = ({ tab }) => (
  <div className="text-white p-8 text-center bg-chat-assistant/30 rounded-lg">
    <Image className="mx-auto mb-4 opacity-50" size={48} />
    <h3 className="text-xl font-medium mb-2">No images found</h3>
    <p className="text-gray-400">
      {tab === "all" 
        ? "You haven't generated any images yet." 
        : `You haven't generated any ${tab} images yet.`}
    </p>
  </div>
);

export default ImageFilter;

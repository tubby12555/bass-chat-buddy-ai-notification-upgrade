
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyGalleryState from "./EmptyGalleryState";

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

      <TabsContent value={tab} className="mt-0" />
    </Tabs>
  );
};

export default ImageFilter;

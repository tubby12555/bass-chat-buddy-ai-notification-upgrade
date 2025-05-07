
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageFilterProps {
  tab: string;
  setTab: (tab: string) => void;
  tabs: string[];
  loading: boolean;
  filteredImages: any[];
}

const getTabLabel = (tabValue: string): string => {
  switch (tabValue) {
    case "all": return "All Images";
    case "flux": return "Flux";
    case "gpt4.1image": return "GPT-4.1";
    default: return tabValue;
  }
};

const ImageFilter: React.FC<ImageFilterProps> = ({ 
  tab, 
  setTab, 
  tabs
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
            {getTabLabel(t)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={tab} className="mt-0" />
    </Tabs>
  );
};

export default ImageFilter;

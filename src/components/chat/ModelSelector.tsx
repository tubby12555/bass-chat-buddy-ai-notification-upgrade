
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelType, MODEL_THEMES } from "@/types/chat";
import { Bot, Sparkles, MessageSquare, Skull } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
}

const ModelSelector = ({ selectedModel, onSelectModel }: ModelSelectorProps) => {
  const handleChange = (value: string) => {
    onSelectModel(value as ModelType);
  };
  
  const getModelIcon = (model: ModelType) => {
    switch(MODEL_THEMES[model].icon) {
      case 'bot':
        return <Bot className="h-4 w-4 mr-2" />;
      case 'sparkles':
        return <Sparkles className="h-4 w-4 mr-2" />;
      case 'message-square':
        return <MessageSquare className="h-4 w-4 mr-2" />;
      case 'skull':
        return <Skull className="h-4 w-4 mr-2" />;
      default:
        return <Bot className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="w-full">
      <label className="text-xs text-gray-400 block mb-1">Model</label>
      <Select value={selectedModel} onValueChange={handleChange}>
        <SelectTrigger className="w-full bg-chat-assistant text-white border-chat-assistant">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent className="bg-chat-assistant text-white border-chat-assistant">
          {Object.keys(MODEL_THEMES).map((model) => (
            <SelectItem 
              key={model} 
              value={model} 
              className="flex items-center"
            >
              <div className="flex items-center">
                {getModelIcon(model as ModelType)}
                <div>
                  <div>{MODEL_THEMES[model as ModelType].name}</div>
                  <div className="text-xs text-gray-400">{MODEL_THEMES[model as ModelType].description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;

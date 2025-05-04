
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelType } from "@/types/chat";

interface ModelSelectorProps {
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
}

const ModelSelector = ({ selectedModel, onSelectModel }: ModelSelectorProps) => {
  const handleChange = (value: string) => {
    onSelectModel(value as ModelType);
  };

  return (
    <div className="w-full">
      <label className="text-xs text-gray-400 block mb-1">Model</label>
      <Select value={selectedModel} onValueChange={handleChange}>
        <SelectTrigger className="w-full bg-chat-assistant text-white border-chat-assistant">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent className="bg-chat-assistant text-white border-chat-assistant">
          <SelectItem value="qwen">Qwen</SelectItem>
          <SelectItem value="gemini">Gemini</SelectItem>
          <SelectItem value="openai">OpenAI</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;

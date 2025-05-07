import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

const STYLE_OPTIONS = [
  "None (Default)",
  "Hyper-Surreal Escape",
  "Post-Analog Glitchscape",
  "AI Dystopia",
  "Neon Fauvism",
  "Vivid Pop Explosion"
];

interface Gpt4ImageGenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const Gpt4ImageGenModal: React.FC<Gpt4ImageGenModalProps> = ({ open, onOpenChange, userId }) => {
  const [prompt, setPrompt] = useState("");
  const [styleMode, setStyleMode] = useState<"dropdown" | "custom">("dropdown");
  const [style, setStyle] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Determine which style to send
      let styleToSend = undefined;
      if (styleMode === "dropdown" && style) styleToSend = style;
      if (styleMode === "custom" && customStyle.trim()) styleToSend = customStyle.trim();
      // Create an entry in content_images first
      const { data: imageData, error: insertError } = await supabase
        .from("content_images")
        .insert({
          user_id: userId,
          prompt,
          style: styleToSend,
          content_type: "gpt4.1image"
        })
        .select()
        .single();
      if (insertError) throw insertError;
      // Now send the generation request
      const payload: Record<string, unknown> = {
        contentType: "gpt4.1image",
        prompt,
        userId,
        imageId: imageData.id
      };
      if (styleToSend) payload.style = styleToSend;
      const res = await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to generate image");
      toast({
        title: "Image Generation Submitted",
        description: "Your image is being generated. It will appear in your gallery when ready.",
      });
      onOpenChange(false);
      setPrompt("");
      setStyle("");
      setCustomStyle("");
      setStyleMode("dropdown");
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setError(message);
      console.error('[Gpt4ImageGenModal] Error in handleSubmit', err);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xs sm:max-w-md p-2 sm:p-6 bg-chat-assistant border-chat-highlight">
        <DialogHeader>
          <DialogTitle className="text-white">Gen Image with GPT-4.1</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-white">Prompt</label>
            <Textarea
              className="w-full border rounded px-2 py-1 bg-black/30 text-white border-chat-accent"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-white">Style</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-1 text-white">
                <input
                  type="radio"
                  checked={styleMode === "dropdown"}
                  onChange={() => setStyleMode("dropdown")}
                />
                Choose from list
              </label>
              <label className="flex items-center gap-1 text-white">
                <input
                  type="radio"
                  checked={styleMode === "custom"}
                  onChange={() => setStyleMode("custom")}
                />
                Custom style
              </label>
            </div>
            {styleMode === "dropdown" ? (
              <select
                className="w-full border rounded px-2 py-1 bg-black/30 text-white border-chat-accent"
                value={style}
                onChange={e => setStyle(e.target.value)}
              >
                <option value="">None (Default)</option>
                {STYLE_OPTIONS.filter(opt => opt !== "None (Default)").map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className="w-full border rounded px-2 py-1 bg-black/30 text-white border-chat-accent"
                type="text"
                value={customStyle}
                onChange={e => setCustomStyle(e.target.value)}
                placeholder="Enter your own style (e.g. 'cyberpunk watercolor')"
              />
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || !prompt}>{loading ? "Generating..." : "Generate"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Gpt4ImageGenModal;

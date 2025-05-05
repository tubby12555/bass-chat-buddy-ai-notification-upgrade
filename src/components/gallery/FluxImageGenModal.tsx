
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const STYLE_OPTIONS = [
  "None (Default)",
  "Hyper-Surreal Escape",
  "Post-Analog Glitchscape",
  "AI Dystopia",
  "Neon Fauvism",
  "Vivid Pop Explosion"
];

interface FluxImageGenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const FluxImageGenModal: React.FC<FluxImageGenModalProps> = ({ open, onOpenChange, userId }) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLE_OPTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Create an entry in content_images first
      const { data: imageData, error: insertError } = await supabase
        .from("content_images")
        .insert({
          user_id: userId,
          prompt,
          style,
          content_type: "flux"
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Now send the generation request
      const res = await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "flux",
          prompt,
          style,
          userId,
          imageId: imageData.id // Send the image ID to link back to our record
        })
      });
      
      if (!res.ok) throw new Error("Failed to submit image generation request");
      
      toast({
        title: "Image Generation Submitted",
        description: "Your image is being generated. It will appear in your gallery when ready.",
      });
      
      onOpenChange(false);
      setPrompt("");
      setStyle(STYLE_OPTIONS[0]);
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setError(message);
      
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
      <DialogContent className="max-w-md bg-chat-assistant border-chat-highlight">
        <DialogHeader>
          <DialogTitle className="text-white">Generate Image with Flux</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-white mb-1">Prompt</label>
            <input
              className="w-full p-2 rounded bg-black/30 text-white border border-chat-accent"
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              required
            />
          </div>
          <div>
            <label className="block text-white mb-1">Style</label>
            <select
              className="w-full p-2 rounded bg-black/30 text-white border border-chat-accent"
              value={style}
              onChange={e => setStyle(e.target.value)}
            >
              {STYLE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || !prompt}>{loading ? "Submitting..." : "Generate"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FluxImageGenModal;

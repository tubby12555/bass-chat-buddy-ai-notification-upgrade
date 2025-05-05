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

interface Gpt4ImageGenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const Gpt4ImageGenModal: React.FC<Gpt4ImageGenModalProps> = ({ open, onOpenChange, userId }) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('[Gpt4ImageGenModal] handleSubmit called', { prompt, style, userId });
    try {
      // Create an entry in content_images first
      const { data: imageData, error: insertError } = await supabase
        .from("content_images")
        .insert({
          user_id: userId,
          prompt,
          style,
          content_type: "gpt4.1image"
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      const payload = {
        contentType: "gpt4.1imagegen",
        prompt,
        style,
        userId,
        imageId: imageData.id
      };
      console.log('[Gpt4ImageGenModal] Sending POST to webhook', payload);
      // Now send the generation request
      const res = await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      console.log('[Gpt4ImageGenModal] POST response', res);
      if (!res.ok) throw new Error("Failed to generate image");
      
      toast({
        title: "Image Generation Submitted",
        description: "Your image is being generated. It will appear in your gallery when ready.",
      });
      
      onOpenChange(false);
      setPrompt("");
      setStyle("");
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
      <DialogContent className="bg-chat-assistant border-chat-highlight">
        <DialogHeader>
          <DialogTitle className="text-white">Gen Image with GPT-4.1</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-white">Prompt</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 bg-black/30 text-white border-chat-accent"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-white">Style</label>
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

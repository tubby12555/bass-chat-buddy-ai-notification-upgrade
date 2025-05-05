import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: "flux",
          prompt,
          style,
          userId
        })
      });
      if (!res.ok) throw new Error("Failed to submit image generation request");
      onOpenChange(false);
      setPrompt("");
      setStyle(STYLE_OPTIONS[0]);
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Image with Flux</DialogTitle>
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
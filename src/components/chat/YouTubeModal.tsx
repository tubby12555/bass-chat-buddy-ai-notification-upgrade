import React, { useState } from "react";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface YouTubeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSubmit: (videoUrl: string) => Promise<void>;
  loading: boolean;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({ open, onOpenChange, userId, onSubmit, loading }) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!videoUrl.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }
    await onSubmit(videoUrl.trim());
    setVideoUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add YouTube Video</DialogTitle>
          <DialogDescription>Paste a YouTube URL to fetch its transcript and content.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="YouTube Video URL"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            disabled={loading}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeModal; 
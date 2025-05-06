import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailModalProps {
  open: boolean;
  onClose: () => void;
  defaultContent: string;
  section: string;
  userId: string;
  onSend?: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ open, onClose, defaultContent, section, userId, onSend }) => {
  const [to, setTo] = useState("");
  const [extra, setExtra] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          contentType: "email",
          section,
          content: defaultContent,
          to,
          extra
        })
      });
      if (!res.ok) throw new Error("Failed to send email");
      setSent(true);
      if (onSend) onSend();
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      let msg = "Unknown error";
      if (typeof err === "object" && err && "message" in err) {
        msg = (err as { message: string }).message;
      }
      setError(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send via Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Recipient email address"
            value={to}
            onChange={e => setTo(e.target.value)}
            disabled={sending || sent}
            required
          />
          <Input
            type="text"
            placeholder="Extra notes for the AI agent (optional)"
            value={extra}
            onChange={e => setExtra(e.target.value)}
            disabled={sending || sent}
          />
          <div className="bg-black/10 rounded p-2 text-white text-sm max-h-40 overflow-y-auto">
            {defaultContent}
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="ghost" disabled={sending || sent}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending || sent || !to || !defaultContent}>
            {sent ? "Sent!" : sending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal; 
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, Expand, Mail, RefreshCw, BookOpen, Newspaper, ScrollText, X, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmailModal from "./EmailModal";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VideoContent {
  id: string;
  user_id: string;
  session_id?: string | null;
  video_url: string;
  video_id?: string | null;
  title?: string | null;
  thumbnail_url?: string | null;
  transcript?: string | null;
  summary?: string | null;
  blog_post_basic?: string | null;
  blog_post_premium?: string | null;
  social_ig?: string | null;
  email?: string | null;
  script?: string | null;
  created_at: string;
  updated_at: string;
}

const PANEL_TYPES = [
  { key: "transcript", label: "Transcript", icon: FileText },
  { key: "summary", label: "Summary", icon: BookOpen },
  { key: "blog_post_basic", label: "Blog Post", icon: Newspaper },
  { key: "email", label: "Email", icon: Mail },
  { key: "script", label: "Script", icon: ScrollText },
];

// Utility to strip markdown for plain text copy
function stripMarkdown(markdown: string) {
  if (!markdown) return '';
  let text = markdown;
  text = text.replace(/^#+\s+/gm, '');
  text = text.replace(/^(\*|-|_){3,}\s*$/gm, '');
  text = text.replace(/!?\[(.*?)\]\(.*?\)/g, '$1');
  text = text.replace(/(\*\*|__|\*|_|~~)(.*?)\1/g, '$2');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/^(\*|-|\d+\.)\s+/gm, '');
  text = text.replace(/\n{2,}/g, '\n\n');
  return text.trim();
}

const ContentSection: React.FC<{ userId: string }> = ({ userId }) => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [modalId, setModalId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, { role: string; content: string }[]>>({});
  const [chatInput, setChatInput] = useState<Record<string, string>>({});
  const [chatLoading, setChatLoading] = useState<Record<string, boolean>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});
  const [copiedPanel, setCopiedPanel] = useState<string | null>(null);
  const [emailPanel, setEmailPanel] = useState<string | null>(null);
  const [emailContent, setEmailContent] = useState<string>("");
  const [emailSection, setEmailSection] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState<Record<string, boolean>>({});
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null);
  const [blogModal, setBlogModal] = useState<{ type: 'blog' | 'blogwithimage', video: VideoContent } | null>(null);
  const [blogNotes, setBlogNotes] = useState("");
  const [blogLoading, setBlogLoading] = useState(false);
  const { toast } = useToast();
  const prevVideosRef = useRef<VideoContent[]>([]);

  // Public fetchVideos function for external refresh
  const fetchVideos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("video_content")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      // Detect new video(s)
      const prevIds = new Set(prevVideosRef.current.map(v => v.id));
      const newVideos = (data as VideoContent[]).filter(v => !prevIds.has(v.id));
      if (prevVideosRef.current.length > 0 && newVideos.length > 0) {
        // Only notify for the first new video (could be extended for multiple)
        const newVideo = newVideos[0];
        const t = toast({
          title: "New video added!",
          description: newVideo.title || newVideo.video_url,
          action: (
            <button
              className="bg-chat-accent text-white px-3 py-1 rounded ml-2"
              onClick={() => {
                setModalId(newVideo.id);
                t.dismiss();
              }}
            >
              View
            </button>
          ),
        });
      }
      setVideos(data as VideoContent[]);
      prevVideosRef.current = data as VideoContent[];
    }
    setLoading(false);
    setRealtimeLoading(false);
  };

  useEffect(() => {
    if (userId && userId !== "anonymous") fetchVideos();
  }, [userId]);

  // Real-time subscription for video_content
  useEffect(() => {
    if (!userId || userId === "anonymous") return;
    const channel = supabase
      .channel('video-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_content',
          filter: `user_id=eq.${userId}`
        },
        () => {
          setRealtimeLoading(true);
          fetchVideos();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Sort by title (case-insensitive), fallback to video_url
  const sortedVideos = [...videos].sort((a, b) => {
    const titleA = (a.title || a.video_url || "").toLowerCase();
    const titleB = (b.title || b.video_url || "").toLowerCase();
    return titleA.localeCompare(titleB);
  });

  const handleGetSummary = async (video: VideoContent) => {
    setSummaryLoading(prev => ({ ...prev, [video.id]: true }));
    try {
      await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          videoId: video.video_id,
          videoUrl: video.video_url,
          contentType: "summary"
        })
      });
      toast({ title: "Summary requested", description: "Summary generation started.", variant: "default" });
    } catch {
      toast({ title: "Error", description: "Failed to request summary.", variant: "destructive" });
    } finally {
      setSummaryLoading(prev => ({ ...prev, [video.id]: false }));
    }
  };

  const handleChatSend = async (video: VideoContent) => {
    const message = chatInput[video.id]?.trim();
    if (!message) return;
    setChatLoading((prev) => ({ ...prev, [video.id]: true }));
    setChatMessages((prev) => ({
      ...prev,
      [video.id]: [...(prev[video.id] || []), { role: "user", content: message }]
    }));
    setChatInput((prev) => ({ ...prev, [video.id]: "" }));
    try {
      const res = await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          videoUrl: video.video_url,
          userMessage: message,
          contentType: "chatwithvideo"
        })
      });
      const text = await res.text();
      setChatMessages((prev) => ({
        ...prev,
        [video.id]: [...(prev[video.id] || []), { role: "assistant", content: text }]
      }));
    } catch {
      setChatMessages((prev) => ({
        ...prev,
        [video.id]: [...(prev[video.id] || []), { role: "system", content: "Error: Could not get response." }]
      }));
    } finally {
      setChatLoading((prev) => ({ ...prev, [video.id]: false }));
    }
  };

  // Add event listener for Escape key to close modal
  useEffect(() => {
    if (!modalId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalId]);

  const handleDelete = async (videoId: string) => {
    if (!window.confirm("Are you sure you want to delete this video and all its content?")) return;
    setDeletingId(videoId);
    const { error } = await supabase.from("video_content").delete().eq("id", videoId);
    if (!error) setVideos((prev) => prev.filter((v) => v.id !== videoId));
    setDeletingId(null);
  };

  const togglePanel = (panel: string) => {
    setOpenPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  if (loading) return <div className="text-white">Loading content...</div>;
  if (sortedVideos.length === 0) return <div className="text-white p-4">No content found. Try adding a YouTube URL to get started.</div>;

  const modalVideo = sortedVideos.find(v => v.id === modalId);

  return (
    <div className="p-2 relative">
      {realtimeLoading && (
        <div className="fixed top-4 right-4 z-50 bg-black/80 px-4 py-2 rounded shadow text-white flex items-center gap-2 animate-pulse">
          <svg className="animate-spin h-5 w-5 text-chat-highlight" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Updating content...
        </div>
      )}
      <div className="mb-4 text-xl font-bold text-white">YouTube Videos <span className="bg-chat-accent text-xs px-2 py-1 rounded-full ml-2">{sortedVideos.length}</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {sortedVideos.map((video) => (
          <div key={video.id} className="bg-chat-assistant rounded-lg shadow-lg flex flex-col w-full max-w-full">
            <div className="relative cursor-pointer" onClick={() => setModalId(video.id)}>
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt={video.title || video.video_url} className="rounded-t-lg w-full h-40 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-40 bg-black/30 flex items-center justify-center rounded-t-lg text-4xl text-white">🎬</div>
              )}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{video.created_at ? new Date(video.created_at).toLocaleDateString() : ""}</div>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="font-bold text-lg truncate break-words" title={video.title || video.video_url}>{video.title || video.video_url}</div>
              <div className="text-xs text-gray-400 mb-2 truncate break-words">{video.summary || video.transcript?.slice(0, 80) || "No summary yet."}</div>
              <div className="flex flex-wrap gap-2 mt-auto">
                <FileText size={20} className="text-white" aria-label="Transcript" />
                <BookOpen size={20} className="text-white" aria-label="Summary" />
                <Newspaper size={20} className="text-white" aria-label="Blog" />
                <Mail size={20} className="text-white" aria-label="Email" />
                <ScrollText size={20} className="text-white" aria-label="Script" />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="icon" variant="outline" className="text-chat-highlight border-chat-highlight" onClick={() => setModalId(video.id)}>View</Button>
                <Button size="icon" variant="destructive" className="ml-auto" onClick={() => handleDelete(video.id)} disabled={deletingId === video.id}>{deletingId === video.id ? "..." : "Delete"}</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Modal Popup for Video Details/Chat */}
      {modalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setModalId(null)}>
          <div
            className="bg-chat-assistant rounded-lg shadow-lg w-full max-w-full sm:max-w-2xl mx-auto relative max-h-[90vh] overflow-y-auto p-2 sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <button className="absolute top-2 right-2 text-white hover:text-chat-highlight" onClick={() => setModalId(null)} aria-label="Close modal"><X size={28} /></button>
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
              {modalVideo.thumbnail_url ? (
                <img src={modalVideo.thumbnail_url} alt={modalVideo.title || modalVideo.video_url} className="rounded w-32 h-20 object-cover" loading="lazy" />
              ) : (
                <div className="w-32 h-20 bg-black/30 flex items-center justify-center rounded text-3xl text-white">🎬</div>
              )}
              <div className="w-full">
                <div className="font-bold text-xl mb-1 truncate break-words">{modalVideo.title || modalVideo.video_url}</div>
                <div className="text-xs text-gray-400 mb-1 break-words">{modalVideo.video_url}</div>
                <div className="text-xs text-gray-400">{modalVideo.created_at ? new Date(modalVideo.created_at).toLocaleDateString() : ""}</div>
              </div>
            </div>
            {PANEL_TYPES.map(({ key, label, icon: Icon }) => {
              const hasContent = !!modalVideo[key as keyof typeof modalVideo];
              return (
                <div key={key} className="mb-3 border border-chat-assistant rounded-lg bg-black/40">
                  <div className="flex flex-col sm:flex-row items-center px-4 py-3 cursor-pointer gap-2" onClick={() => togglePanel(key)}>
                    <span className={`h-2 w-2 rounded-full mr-3 ${hasContent ? "bg-green-500" : "bg-gray-500"}`}></span>
                    <Icon size={20} className="text-white mr-2" />
                    <span className="font-semibold text-white flex-1 text-sm truncate break-words">{label}</span>
                    <div className="flex flex-wrap gap-2">
                      {key === "blog_post_basic" && <>
                        <Button size="sm" variant="outline" className="text-chat-highlight border-chat-highlight" title="Generate a blog post in your preferred style." onClick={e => {e.stopPropagation(); setBlogModal({ type: 'blog', video: modalVideo });}}>Quick Blog</Button>
                        <Button size="sm" variant="outline" className="text-chat-highlight border-chat-highlight" title="Generate a blog post and an AI cover image." onClick={e => {e.stopPropagation(); setBlogModal({ type: 'blogwithimage', video: modalVideo });}}>Blog + Cover Image</Button>
                      </>}
                      <Button size="icon" variant="ghost" className="text-white" onClick={e => {e.stopPropagation(); navigator.clipboard.writeText(modalVideo[key] || ""); setCopiedPanel(key); setTimeout(() => setCopiedPanel(null), 1200);}} disabled={!hasContent} title={copiedPanel === key ? "Copied!" : "Copy Markdown"}><Copy size={16} /></Button>
                      <Button size="icon" variant="ghost" className="text-white" onClick={e => {e.stopPropagation(); navigator.clipboard.writeText(stripMarkdown(modalVideo[key] || "")); setCopiedPanel(key + '-plain'); setTimeout(() => setCopiedPanel(null), 1200);}} disabled={!hasContent} title={copiedPanel === key + '-plain' ? "Copied!" : "Copy Plain Text"}><Copy size={16} /></Button>
                      <Button size="icon" variant="ghost" className="text-white" onClick={e => {e.stopPropagation(); setEmailPanel(key); setEmailContent(modalVideo[key] || ""); setEmailSection(key);}} disabled={!hasContent} title="Send via Email"><Mail size={16} /></Button>
                      <Button size="icon" variant="ghost" className="text-white" onClick={e => {e.stopPropagation(); setMaximizedPanel(key);}} title="Maximize"><Maximize2 size={16} /></Button>
                      {key === "summary" && <Button size="icon" variant="ghost" className="text-white" onClick={e => {e.stopPropagation(); handleGetSummary(modalVideo);}} disabled={summaryLoading[modalVideo.id]}>{summaryLoading[modalVideo.id] ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <RefreshCw size={16} />}</Button>}
                    </div>
                    <span className="ml-2 text-white">{openPanels[key] ? "▼" : "▶"}</span>
                  </div>
                  {openPanels[key] && (
                    <div className="px-4 pb-4 text-white whitespace-pre-line text-sm break-words overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{modalVideo[key] || ''}</ReactMarkdown>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="mt-4">
              <div className="font-bold mb-2">Chat</div>
              <div className="max-h-64 overflow-y-auto bg-black/10 rounded p-2 mb-2" style={{ minHeight: 80 }}>
                {(chatMessages[modalVideo.id] || []).map((msg, idx) => (
                  <div key={idx} className={`mb-2 ${msg.role === "user" ? "text-chat-highlight" : msg.role === "assistant" ? "text-green-400" : "text-red-400"}`}>
                    <b>{msg.role === "user" ? "You" : msg.role === "assistant" ? "AI" : "System"}:</b> {msg.content}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded p-2 bg-black/20 text-white border border-chat-accent/30 focus:outline-none"
                  placeholder="Ask a question about this video..."
                  value={chatInput[modalVideo.id] || ""}
                  onChange={e => setChatInput(prev => ({ ...prev, [modalVideo.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") handleChatSend(modalVideo); }}
                  disabled={chatLoading[modalVideo.id]}
                />
                <Button onClick={() => handleChatSend(modalVideo)} disabled={chatLoading[modalVideo.id] || !(chatInput[modalVideo.id] || "").trim()}>
                  {chatLoading[modalVideo.id] ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {emailPanel && (
        <EmailModal
          open={!!emailPanel}
          onClose={() => setEmailPanel(null)}
          defaultContent={emailContent}
          section={emailSection}
          userId={userId}
        />
      )}
      {/* Maximized Content Panel Modal */}
      {maximizedPanel && (
        <Dialog open={!!maximizedPanel} onOpenChange={() => setMaximizedPanel(null)}>
          <DialogContent className="w-full max-w-full sm:max-w-4xl bg-black border-chat-highlight p-2 sm:p-6 h-[90vh] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-base sm:text-xl truncate">{PANEL_TYPES.find(p => p.key === maximizedPanel)?.label || "Content"}</DialogTitle>
            </DialogHeader>
            <div className="text-white whitespace-pre-line max-h-[70vh] overflow-y-auto p-2 sm:p-4 text-sm break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{modalVideo[maximizedPanel] || ''}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Blog Generation Modal */}
      {blogModal && (
        <Dialog open={!!blogModal} onOpenChange={() => { setBlogModal(null); setBlogNotes(""); setBlogLoading(false); }}>
          <DialogContent className="w-full max-w-full sm:max-w-lg bg-black border-chat-highlight p-2 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-base sm:text-xl truncate">{blogModal.type === 'blog' ? 'Quick Blog' : 'Blog + Cover Image'}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="text-white text-sm">Add extra notes or instructions for the AI (optional):</div>
              <textarea className="w-full min-h-[80px] rounded bg-black/30 text-white p-2 border border-chat-accent/30 focus:outline-none text-sm" value={blogNotes} onChange={e => setBlogNotes(e.target.value)} placeholder="e.g. Focus on the latest trends, mention my company, etc." />
              <Button onClick={async () => {
                setBlogLoading(true);
                try {
                  await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      userId,
                      videoUrl: blogModal.video.video_url,
                      contentType: blogModal.type === 'blog' ? 'blog' : 'blogwithimage',
                      extraNotes: blogNotes
                    })
                  });
                  toast({ title: "Request sent", description: blogModal.type === 'blog' ? "Blog generation started." : "Blog + image generation started.", variant: "default" });
                  setBlogModal(null); setBlogNotes("");
                } catch {
                  toast({ title: "Error", description: "Failed to send request.", variant: "destructive" });
                } finally {
                  setBlogLoading(false);
                }
              }} disabled={blogLoading} className="w-full sm:w-auto">
                {blogLoading ? <svg className="animate-spin h-4 w-4 inline-block mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : (blogModal.type === 'blog' ? 'Generate Blog' : 'Generate Blog + Image')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContentSection;

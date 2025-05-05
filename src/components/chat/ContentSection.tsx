import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, Expand, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const ContentSection: React.FC<{ userId: string }> = ({ userId }) => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, { role: string; content: string }[]>>({});
  const [chatInput, setChatInput] = useState<Record<string, string>>({});
  const [chatLoading, setChatLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("video_content")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setVideos(data as VideoContent[]);
      setLoading(false);
    };
    if (userId && userId !== "anonymous") fetchData();
  }, [userId]);

  // Sort by title (case-insensitive), fallback to video_url
  const sortedVideos = [...videos].sort((a, b) => {
    const titleA = (a.title || a.video_url || "").toLowerCase();
    const titleB = (b.title || b.video_url || "").toLowerCase();
    return titleA.localeCompare(titleB);
  });

  const handleGetSummary = async (video: VideoContent) => {
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

  if (loading) return <div className="text-white">Loading content...</div>;
  if (sortedVideos.length === 0) return <div className="text-white p-4">No content found. Try adding a YouTube URL to get started.</div>;

  return (
    <div className="p-2">
      <div className="mb-4 text-xl font-bold text-white">YouTube Videos <span className="bg-chat-accent text-xs px-2 py-1 rounded-full ml-2">{sortedVideos.length}</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedVideos.map((video) => (
          <div key={video.id} className="bg-chat-assistant rounded-lg shadow-lg flex flex-col">
            <div className="relative cursor-pointer" onClick={() => setExpandedId(expandedId === video.id ? null : video.id)}>
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt={video.title || video.video_url} className="rounded-t-lg w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-black/30 flex items-center justify-center rounded-t-lg text-4xl text-white">🎬</div>
              )}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{video.created_at ? new Date(video.created_at).toLocaleDateString() : ""}</div>
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <div className="font-bold text-lg truncate" title={video.title || video.video_url}>{video.title || video.video_url}</div>
              <div className="text-xs text-gray-400 mb-2 truncate">{video.summary || video.transcript?.slice(0, 80) || "No summary yet."}</div>
              <div className="flex gap-2 mt-auto">
                <Button size="icon" variant="ghost" title="Transcript" className="border border-green-500 text-green-400"><span role="img" aria-label="transcript">📄</span></Button>
                <Button size="icon" variant="ghost" title="Summary" className="border border-blue-500 text-blue-400"><span role="img" aria-label="summary">📝</span></Button>
                <Button size="icon" variant="ghost" title="Blog" className="border border-purple-500 text-purple-400"><span role="img" aria-label="blog">📰</span></Button>
                <Button size="icon" variant="ghost" title="Email" className="border border-pink-500 text-pink-400"><span role="img" aria-label="email">✉️</span></Button>
                <Button size="icon" variant="ghost" title="Script" className="border border-yellow-500 text-yellow-400"><span role="img" aria-label="script">📜</span></Button>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="icon" variant="outline" className="text-chat-highlight border-chat-highlight" onClick={() => setExpandedId(video.id)}>View</Button>
                <Button size="icon" variant="destructive" className="ml-auto">Delete</Button>
              </div>
            </div>
            {expandedId === video.id && (
              <div className="bg-black/80 text-white p-4 rounded-b-lg mt-2">
                <div className="mb-2 font-bold text-lg">{video.title || video.video_url}</div>
                <div className="mb-2 text-xs text-gray-400">{video.video_url}</div>
                <div className="mb-2"><b>Transcript:</b> <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.transcript || "No transcript yet."}</div></div>
                <div className="mb-2"><b>Summary:</b> <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px] flex-1">{video.summary || "No summary yet."}</div></div>
                <div className="mb-2"><b>Blog Post (Basic):</b> <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.blog_post_basic || "No blog post yet."}</div></div>
                <div className="mb-2"><b>Blog Post (Premium):</b> <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.blog_post_premium || "No premium blog post yet."}</div></div>
                <div className="mb-2"><b>Social IG:</b> <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.social_ig || "No IG post yet."}</div></div>
                <div className="mb-2"><b>Email:</b> <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.email || "No email content yet."}</div></div>
                <div className="mb-2"><b>Script:</b> <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.script || "No script yet."}</div></div>
                <div className="mt-4">
                  <div className="font-bold mb-2">Chat</div>
                  <div className="max-h-64 overflow-y-auto bg-black/10 rounded p-2 mb-2" style={{ minHeight: 80 }}>
                    {(chatMessages[video.id] || []).map((msg, idx) => (
                      <div key={idx} className={`mb-2 ${msg.role === "user" ? "text-chat-highlight" : msg.role === "assistant" ? "text-green-400" : "text-red-400"}`}>
                        <b>{msg.role === "user" ? "You" : msg.role === "assistant" ? "AI" : "System"}:</b> {msg.content}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded p-2 bg-black/20 text-white border border-chat-accent/30 focus:outline-none"
                      placeholder="Ask a question about this video..."
                      value={chatInput[video.id] || ""}
                      onChange={e => setChatInput(prev => ({ ...prev, [video.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") handleChatSend(video); }}
                      disabled={chatLoading[video.id]}
                    />
                    <Button onClick={() => handleChatSend(video)} disabled={chatLoading[video.id] || !(chatInput[video.id] || "").trim()}>
                      {chatLoading[video.id] ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentSection;

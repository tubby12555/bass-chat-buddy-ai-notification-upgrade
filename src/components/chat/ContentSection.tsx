import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, Expand, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoContent {
  id: string;
  user_id: string;
  session_id?: string;
  video_url: string;
  video_id?: string;
  transcript?: string;
  summary?: string;
  blog_post_basic?: string;
  blog_post_premium?: string;
  social_ig?: string;
  email?: string;
  script?: string;
  created_at: string;
  updated_at: string;
}

const ContentSection: React.FC<{ userId: string }> = ({ userId }) => {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("content");
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
  if (videos.length === 0) return <div className="text-white p-4">No content found. Try adding a YouTube URL to get started.</div>;

  return (
    <Tabs defaultValue="content" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-4 bg-chat-accent/30">
        <TabsTrigger value="details" className="text-white data-[state=active]:bg-chat-accent">Details</TabsTrigger>
        <TabsTrigger value="content" className="text-white data-[state=active]:bg-chat-accent">Content</TabsTrigger>
        <TabsTrigger value="notes" className="text-white data-[state=active]:bg-chat-accent">Notes</TabsTrigger>
        <TabsTrigger value="chat" className="text-white data-[state=active]:bg-chat-accent">Chat</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-6">
        {videos.map((video) => (
          <Card key={video.id} className="bg-chat-assistant text-white rounded-lg">
            <div className="bg-gradient-to-r from-chat-accent/20 to-transparent p-1 rounded-t-lg">
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="text-xl font-bold">{video.video_url}</h3>
                </div>
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="text-chat-highlight underline text-xs">Open Video</a>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Transcript</h4>
                <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.transcript || "No transcript yet."}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Summary</h4>
                <div className="flex items-center gap-2">
                  <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px] flex-1">{video.summary || "No summary yet."}</div>
                  <Button className="p-2 hover:bg-chat-accent/30 rounded-md" variant="ghost" size="icon" onClick={() => handleGetSummary(video)}><RefreshCw size={20} /></Button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Blog Post (Basic)</h4>
                <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.blog_post_basic || "No blog post yet."}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Blog Post (Premium)</h4>
                <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.blog_post_premium || "No premium blog post yet."}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Social IG</h4>
                <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.social_ig || "No IG post yet."}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Email</h4>
                <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.email || "No email content yet."}</div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Script</h4>
                <div className="whitespace-pre-line bg-black/20 rounded p-2 min-h-[40px]">{video.script || "No script yet."}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="chat" className="space-y-6">
        {videos.map((video) => (
          <Card key={video.id + "-chat"} className="bg-chat-assistant text-white rounded-lg">
            <div className="bg-gradient-to-r from-chat-accent/20 to-transparent p-1 rounded-t-lg">
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="text-xl font-bold">Chat about: {video.video_url}</h3>
                </div>
              </div>
            </div>
            <CardContent className="p-4 space-y-4">
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
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="notes" className="text-white">
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2">Your Notes</h3>
          <textarea 
            className="w-full h-64 p-3 bg-chat-assistant text-white rounded-lg border border-chat-accent/30 focus:outline-none focus:ring-2 focus:ring-chat-highlight"
            placeholder="Add your notes here..."
          ></textarea>
          <button className="mt-2 px-4 py-2 bg-chat-highlight text-white rounded-md hover:bg-chat-highlight/80">
            Save Notes
          </button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContentSection;

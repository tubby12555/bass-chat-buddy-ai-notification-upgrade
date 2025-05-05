import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, FileText, Expand, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentSectionProps {
  userId: string;
}

interface Summary {
  id: string;
  video_url: string | null;
  video_id: string | null;
  summary: string | null;
  created_at: string;
}

interface Transcript {
  id: string;
  video_url: string | null;
  video_id: string | null;
  transcript: string | null;
  created_at: string;
}

interface BlogPost {
  id: string;
  video_url: string | null;
  video_id: string | null;
  content: string | null;
  created_at: string;
}

interface EmailContent {
  id: string;
  video_url: string | null;
  video_id: string | null;
  content: string | null;
  created_at: string;
}

interface Script {
  id: string;
  video_url: string | null;
  video_id: string | null;
  content: string | null;
  created_at: string;
}

function isValidSummary(item: unknown): item is Summary {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    'id' in obj &&
    'video_url' in obj &&
    'video_id' in obj &&
    'summary' in obj &&
    'created_at' in obj
  );
}

function isValidTranscript(item: unknown): item is Transcript {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    'id' in obj &&
    'video_url' in obj &&
    'video_id' in obj &&
    'transcript' in obj &&
    'created_at' in obj
  );
}

// Ensure we have created_at field in all data objects
type WithCreatedAt<T> = T & { created_at: string };
const ensureCreatedAt = <T extends { created_at?: string }>(data: T[]): WithCreatedAt<T>[] => {
  return data.map(item => {
    if (!('created_at' in item) || !item.created_at) {
      return { ...item, created_at: new Date().toISOString() } as WithCreatedAt<T>;
    }
    return item as WithCreatedAt<T>;
  });
};

const ContentSection: React.FC<ContentSectionProps> = ({ userId }) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [emailContent, setEmailContent] = useState<EmailContent[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSchemaError(null);
      
      // Fetch summaries
      const { data: summariesData, error: summariesError } = await supabase
        .from("summaries")
        .select("id, video_url, video_id, summary, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (summariesError && summariesError.message.includes("column 'video_url' does not exist")) {
        setSchemaError("Your database schema is not up to date. Please run the latest migrations for 'summaries'.");
        setSummaries([]);
      } else if (
        !summariesError &&
        Array.isArray(summariesData)
      ) {
        const validatedData = ensureCreatedAt(summariesData);
        setSummaries(validatedData as Summary[]);
      } else {
        setSummaries([]);
      }
      
      // Fetch transcripts
      const { data: transcriptsData, error: transcriptsError } = await supabase
        .from("transcripts")
        .select("id, video_url, video_id, transcript, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (transcriptsError && transcriptsError.message.includes("column 'video_url' does not exist")) {
        setSchemaError("Your database schema is not up to date. Please run the latest migrations for 'transcripts'.");
        setTranscripts([]);
      } else if (
        !transcriptsError &&
        Array.isArray(transcriptsData)
      ) {
        const validatedData = ensureCreatedAt(transcriptsData);
        setTranscripts(validatedData as Transcript[]);
      } else {
        setTranscripts([]);
      }

      // In a real implementation, we would also fetch blog posts, email content, and scripts
      // For now, we'll just initialize them as empty arrays
      setBlogPosts([]);
      setEmailContent([]);
      setScripts([]);
      
      setLoading(false);
    };
    
    if (userId && userId !== "anonymous") fetchData();

    // --- Supabase realtime subscriptions ---
    if (userId && userId !== "anonymous") {
      const channel = supabase.channel('content-realtime');
      // Listen for INSERT/UPDATE on summaries
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'summaries',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        fetchData();
      });
      // Listen for INSERT/UPDATE on transcripts
      channel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transcripts',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        fetchData();
      });
      channel.subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  // Add handler for Get Summary
  const handleGetSummary = async (videoId: string, videoUrl: string) => {
    try {
      await fetch("https://n8n.srv728397.hstgr.cloud/webhook/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          videoId,
          videoUrl,
          contentType: "summary"
        })
      });
    } catch (err) {
      // Optionally handle error
    }
  };

  if (loading) return <div className="text-white">Loading content...</div>;
  if (schemaError) return <div className="p-4 text-red-500">{schemaError}</div>;
  if (summaries.length === 0 && transcripts.length === 0) {
    return <div className="text-white p-4">No content found. Try adding a YouTube URL to get started.</div>;
  }

  return (
    <Tabs defaultValue="content" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="mb-4 bg-chat-accent/30">
        <TabsTrigger value="details" className="text-white data-[state=active]:bg-chat-accent">
          <FileText className="mr-2 h-4 w-4" />
          Details
        </TabsTrigger>
        <TabsTrigger value="content" className="text-white data-[state=active]:bg-chat-accent">
          <FileText className="mr-2 h-4 w-4" />
          Content
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-white data-[state=active]:bg-chat-accent">
          <FileText className="mr-2 h-4 w-4" />
          Notes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="text-white">
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2">Video Details</h3>
          {summaries.length > 0 && (
            <div>
              <p><strong>Title:</strong> {summaries[0].video_url?.split('watch?v=')[1] || "Unknown"}</p>
              <p><strong>URL:</strong> <a href={summaries[0].video_url || "#"} target="_blank" rel="noopener noreferrer" className="text-chat-highlight underline">{summaries[0].video_url}</a></p>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="content" className="space-y-6">
        {transcripts.map((transcript) => (
          <Card key={`transcript-${transcript.id}`} className="bg-chat-assistant text-white rounded-lg">
            <div className="bg-gradient-to-r from-chat-accent/20 to-transparent p-1 rounded-t-lg">
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="text-xl font-bold">Transcript</h3>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-chat-accent/30 rounded-md">
                    <Copy size={20} />
                  </button>
                  <button className="p-2 hover:bg-chat-accent/30 rounded-md">
                    <Mail size={20} />
                  </button>
                  <button className="p-2 hover:bg-chat-accent/30 rounded-md">
                    <Expand size={20} />
                  </button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-2 max-h-64 overflow-y-auto">
                <div className="whitespace-pre-line">{transcript.transcript || "No transcript yet."}</div>
              </div>
            </CardContent>
          </Card>
        ))}

        {summaries.map((summary) => (
          <Card key={`summary-${summary.id}`} className="bg-chat-assistant text-white rounded-lg">
            <div className="bg-gradient-to-r from-chat-accent/20 to-transparent p-1 rounded-t-lg">
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <h3 className="text-xl font-bold">Summary</h3>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-chat-accent/30 rounded-md">
                    <Copy size={20} />
                  </button>
                  <button className="p-2 hover:bg-chat-accent/30 rounded-md">
                    <Mail size={20} />
                  </button>
                  <button className="p-2 hover:bg-chat-accent/30 rounded-md">
                    <Expand size={20} />
                  </button>
                  <Button
                    className="p-2 hover:bg-chat-accent/30 rounded-md"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleGetSummary(summary.video_id || '', summary.video_url || '')}
                  >
                    <RefreshCw size={20} />
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <div className="whitespace-pre-line">{summary.summary || "No summary yet."}</div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Placeholder for future content types */}
        <Card className="bg-chat-assistant text-white rounded-lg opacity-50">
          <div className="bg-gradient-to-r from-chat-accent/20 to-transparent p-1 rounded-t-lg">
            <div className="flex justify-between items-center p-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <h3 className="text-xl font-bold">Blog Post</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Copy size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Mail size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Expand size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="mb-2">
              <div className="whitespace-pre-line">Coming soon - this feature will generate blog posts from your YouTube content.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chat-assistant text-white rounded-lg opacity-50">
          <div className="bg-gradient-to-r from-chat-accent/20 to-transparent p-1 rounded-t-lg">
            <div className="flex justify-between items-center p-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <h3 className="text-xl font-bold">Email</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Copy size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Mail size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Expand size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="mb-2">
              <div className="whitespace-pre-line">Coming soon - this feature will generate email content from your YouTube videos.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-chat-assistant text-white rounded-lg opacity-50">
          <div className="bg-gradient-to-r from-chat-accent/20 to-transparent p-1 rounded-t-lg">
            <div className="flex justify-between items-center p-2">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <h3 className="text-xl font-bold">Script</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Copy size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Mail size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <Expand size={20} />
                </button>
                <button className="p-2 hover:bg-chat-accent/30 rounded-md" disabled>
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="mb-2">
              <div className="whitespace-pre-line">Coming soon - this feature will generate scripts from your YouTube content.</div>
            </div>
          </CardContent>
        </Card>
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

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

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
  text: string | null;
  created_at: string;
}

function isValidSummary(item: any): item is Summary {
  return (
    item !== null &&
    typeof item === 'object' &&
    'id' in item &&
    'video_url' in item &&
    'video_id' in item &&
    'summary' in item &&
    'created_at' in item
  );
}

function isValidTranscript(item: any): item is Transcript {
  return (
    item !== null &&
    typeof item === 'object' &&
    'id' in item &&
    'video_url' in item &&
    'video_id' in item &&
    'text' in item &&
    'created_at' in item
  );
}

const ContentSection: React.FC<ContentSectionProps> = ({ userId }) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);

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
        Array.isArray(summariesData) &&
        summariesData.every(isValidSummary)
      ) {
        setSummaries(summariesData);
      } else {
        setSummaries([]);
      }
      // Fetch transcripts
      const { data: transcriptsData, error: transcriptsError } = await supabase
        .from("transcripts")
        .select("id, video_url, video_id, text, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (transcriptsError && transcriptsError.message.includes("column 'video_url' does not exist")) {
        setSchemaError("Your database schema is not up to date. Please run the latest migrations for 'transcripts'.");
        setTranscripts([]);
      } else if (
        !transcriptsError &&
        Array.isArray(transcriptsData) &&
        transcriptsData.every(isValidTranscript)
      ) {
        setTranscripts(transcriptsData);
      } else {
        setTranscripts([]);
      }
      setLoading(false);
    };
    if (userId && userId !== "anonymous") fetchData();
  }, [userId]);

  if (loading) return null;
  if (schemaError) return <div className="p-4 text-red-500">{schemaError}</div>;
  if (summaries.length === 0 && transcripts.length === 0) return null;

  return (
    <div className="p-4 space-y-6">
      {summaries.map((summary) => (
        <Card key={summary.id} className="bg-chat-assistant text-white">
          <CardHeader>
            <CardTitle>YouTube Summary</CardTitle>
            <CardDescription>
              {summary.video_url && (
                <a href={summary.video_url} target="_blank" rel="noopener noreferrer" className="underline text-chat-highlight">
                  {summary.video_url}
                </a>
              )}
              {summary.video_id && <span className="ml-2">Video ID: {summary.video_id}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>Summary:</strong>
              <div className="whitespace-pre-line mt-1">{summary.summary || "No summary yet."}</div>
            </div>
          </CardContent>
        </Card>
      ))}
      {transcripts.map((transcript) => (
        <Card key={transcript.id} className="bg-chat-assistant text-white">
          <CardHeader>
            <CardTitle>YouTube Transcript</CardTitle>
            <CardDescription>
              {transcript.video_url && (
                <a href={transcript.video_url} target="_blank" rel="noopener noreferrer" className="underline text-chat-highlight">
                  {transcript.video_url}
                </a>
              )}
              {transcript.video_id && <span className="ml-2">Video ID: {transcript.video_id}</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>Transcript:</strong>
              <div className="whitespace-pre-line mt-1 max-h-64 overflow-y-auto">{transcript.text || "No transcript yet."}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContentSection; 
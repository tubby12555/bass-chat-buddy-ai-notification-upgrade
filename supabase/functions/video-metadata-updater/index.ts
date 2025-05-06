import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Add type for results
interface VideoResult {
  id: string;
  success: boolean;
  title?: string;
  thumbnail_url?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Missing env vars' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Find videos missing title or thumbnail_url
  const { data: videos, error } = await supabase
    .from('video_content')
    .select('id, video_url, video_id, user_id, title, thumbnail_url')
    .or('title.is.null,thumbnail_url.is.null')
    .limit(10);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const results: VideoResult[] = [];

  for (const video of videos || []) {
    try {
      if (!video.video_url) continue;
      const oEmbedUrl = `https://www.youtube.com/oembed?url=${video.video_url}&format=json`;
      const meta = await fetch(oEmbedUrl).then(res => res.json());
      const { title, thumbnail_url } = meta;
      await supabase
        .from('video_content')
        .update({ title, thumbnail_url })
        .eq('id', video.id);
      results.push({ id: video.id, success: true, title, thumbnail_url });
    } catch (err) {
      results.push({ id: video.id, success: false, error: err.message });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}); 
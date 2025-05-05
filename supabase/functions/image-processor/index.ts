
// Supabase Edge Function to automatically process images when they're inserted
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Image processor function started");
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get pending images that need processing
    console.log("Fetching pending images...");
    const { data: pendingImages, error: fetchError } = await supabase
      .from('content_images')
      .select('id, user_id, temp_url, base64_image, content_type')
      .is('permanent_url', null)
      .not('temp_url', 'is', null)
      .limit(10);

    if (fetchError) {
      console.error("Error fetching pending images:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingImages?.length || 0} pending images to process`);

    if (!pendingImages || pendingImages.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending images to process' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Process each pending image
    for (const image of pendingImages) {
      try {
        console.log(`Processing image ${image.id}`);
        let imageBuffer: ArrayBuffer;
        let contentType = 'image/png';
        let ext = 'png';
        
        // Get image data from temp_url
        if (image.temp_url) {
          console.log(`Fetching from temp_url: ${image.temp_url}`);
          const res = await fetch(image.temp_url);
          if (!res.ok) {
            results.push({ id: image.id, success: false, error: 'Failed to fetch temp URL' });
            continue;
          }
          
          imageBuffer = await res.arrayBuffer();
          const ct = res.headers.get('content-type');
          if (ct) contentType = ct;
          if (ct && ct.includes('jpeg')) ext = 'jpg';
        } else if (image.base64_image) {
          console.log(`Processing base64 image for ${image.id}`);
          const matches = image.base64_image.match(/^data:(image\/\w+);base64,(.+)$/);
          if (!matches) {
            results.push({ id: image.id, success: false, error: 'Invalid base64 image' });
            continue;
          }
          
          contentType = matches[1];
          ext = contentType.split('/')[1];
          imageBuffer = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0)).buffer;
        } else {
          results.push({ id: image.id, success: false, error: 'No image source found' });
          continue;
        }

        const fileName = `image-${image.id}.${ext}`;
        const storagePath = `${image.user_id}/${image.id}/${fileName}`;
        
        console.log(`Uploading to storage: ${storagePath}`);
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user_images')
          .upload(storagePath, imageBuffer, {
            contentType,
            upsert: true,
          });
        
        if (uploadError) {
          console.error("Storage upload failed:", uploadError);
          results.push({ id: image.id, success: false, error: 'Storage upload failed' });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('user_images')
          .getPublicUrl(storagePath);
          
        const publicUrl = publicUrlData?.publicUrl;
        console.log(`Got public URL: ${publicUrl}`);
        
        // Update database record
        const updateFields: Record<string, string | null> = {
          permanent_url: publicUrl,
          bucket: 'user_images',
          path: storagePath,
        };
        
        if (image.temp_url) updateFields.temp_url = null;
        if (image.base64_image) updateFields.base64_image = null;
        
        console.log(`Updating database record for ${image.id}`);
        const { error: updateError } = await supabase
          .from('content_images')
          .update(updateFields)
          .eq('id', image.id);
        
        if (updateError) {
          console.error("Database update failed:", updateError);
          results.push({ id: image.id, success: false, error: 'Database update failed' });
          continue;
        }
        
        results.push({ id: image.id, success: true, publicUrl });
        console.log(`Successfully processed image ${image.id}`);
      } catch (err) {
        console.error(`Error processing image ${image.id}:`, err);
        results.push({ id: image.id, success: false, error: err.message });
      }
    }

    console.log(`Processed ${results.filter(r => r.success).length}/${pendingImages.length} images`);
    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.filter(r => r.success).length}/${pendingImages.length} images`,
        results 
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error in image-processor function:', err);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

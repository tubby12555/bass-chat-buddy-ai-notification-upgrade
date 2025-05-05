
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
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error", 
          details: "Missing environment variables" 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get pending images that need processing
    console.log("Fetching pending images...");
    const { data: pendingImages, error: fetchError } = await supabase
      .from('content_images')
      .select('id, user_id, temp_url, content_type')
      .is('permanent_url', null)
      .not('temp_url', 'is', null)
      .limit(10);

    if (fetchError) {
      console.error("Error fetching pending images:", fetchError);
      console.error("Error details:", fetchError.message);
      console.error("Error stack:", fetchError.stack);
      return new Response(
        JSON.stringify({ 
          error: fetchError.message, 
          details: fetchError.details,
          hint: fetchError.hint,
          stack: fetchError.stack 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
          try {
            const res = await fetch(image.temp_url);
            if (!res.ok) {
              const errorText = await res.text();
              console.error(`Failed to fetch temp URL for image ${image.id}:`, res.status, errorText);
              results.push({ 
                id: image.id, 
                success: false, 
                error: `Failed to fetch temp URL: ${res.status}`, 
                details: errorText
              });
              continue;
            }
            
            imageBuffer = await res.arrayBuffer();
            const ct = res.headers.get('content-type');
            if (ct) contentType = ct;
            if (ct && ct.includes('jpeg')) ext = 'jpg';
            console.log(`Image ${image.id} fetched successfully, content-type: ${contentType}`);
          } catch (fetchErr) {
            console.error(`Error fetching image ${image.id}:`, fetchErr);
            console.error(`Error stack:`, fetchErr.stack);
            results.push({ 
              id: image.id, 
              success: false, 
              error: 'Failed to fetch image', 
              details: fetchErr.message 
            });
            continue;
          }
        } else {
          console.error(`No temp_url found for image ${image.id}`);
          results.push({ 
            id: image.id, 
            success: false, 
            error: 'No image source found' 
          });
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
          console.error(`Storage upload failed for image ${image.id}:`, uploadError);
          console.error(`Error message:`, uploadError.message);
          console.error(`Error details:`, uploadError.details);
          results.push({ 
            id: image.id, 
            success: false, 
            error: 'Storage upload failed', 
            details: uploadError.message 
          });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('user_images')
          .getPublicUrl(storagePath);
          
        const publicUrl = publicUrlData?.publicUrl;
        console.log(`Got public URL for image ${image.id}: ${publicUrl}`);
        
        // Update database record
        const updateFields: Record<string, string | null> = {
          permanent_url: publicUrl,
          bucket: 'user_images',
          path: storagePath,
        };
        
        if (image.temp_url) updateFields.temp_url = null;
        
        console.log(`Updating database record for ${image.id}`);
        const { error: updateError } = await supabase
          .from('content_images')
          .update(updateFields)
          .eq('id', image.id);
        
        if (updateError) {
          console.error(`Database update failed for image ${image.id}:`, updateError);
          console.error(`Error message:`, updateError.message);
          console.error(`Error details:`, updateError.details);
          results.push({ 
            id: image.id, 
            success: false, 
            error: 'Database update failed', 
            details: updateError.message 
          });
          continue;
        }
        
        results.push({ id: image.id, success: true, publicUrl });
        console.log(`Successfully processed image ${image.id}`);
      } catch (err) {
        console.error(`Error processing image ${image.id}:`, err);
        console.error(`Error stack:`, err.stack);
        results.push({ 
          id: image.id, 
          success: false, 
          error: err.message, 
          stack: err.stack 
        });
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
    console.error('Error stack:', err.stack);
    return new Response(
      JSON.stringify({ 
        error: err.message, 
        stack: err.stack 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

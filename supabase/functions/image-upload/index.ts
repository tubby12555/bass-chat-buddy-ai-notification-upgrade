// This file is a Supabase Edge Function (Deno runtime, ESM imports, Supabase context)
// Linter warnings about Deno/ESM can be ignored in this context
// deno-lint-ignore-file
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { table, id, userId, tempUrl, base64Image, filename } = await req.json();
    if (!table || !id || !userId || (!tempUrl && !base64Image)) {
      return new Response('Missing required fields', { status: 400 });
    }

    let imageBuffer: ArrayBuffer;
    let ext = 'png';
    let contentType = 'image/png';
    let fileName = filename || `${id}.png`;

    if (tempUrl) {
      const res = await fetch(tempUrl);
      if (!res.ok) {
        return new Response('Failed to fetch tempUrl', { status: 400 });
      }
      imageBuffer = await res.arrayBuffer();
      const ct = res.headers.get('content-type');
      if (ct) contentType = ct;
      if (ct && ct.includes('jpeg')) ext = 'jpg';
      if (ct && ct.includes('png')) ext = 'png';
      if (!filename) fileName = `${id}.${ext}`;
    } else if (base64Image) {
      const matches = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) {
        return new Response('Invalid base64 image', { status: 400 });
      }
      contentType = matches[1];
      ext = contentType.split('/')[1];
      imageBuffer = Uint8Array.from(atob(matches[2]), c => c.charCodeAt(0)).buffer;
      if (!filename) fileName = `${id}.${ext}`;
    } else {
      return new Response('No image data provided', { status: 400 });
    }

    // Upload to storage
    const storagePath = `${userId}/${id}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user images')
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      });
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response('Failed to upload image', { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('user images').getPublicUrl(storagePath);
    const publicUrl = publicUrlData?.publicUrl;

    // Update DB row
    const updateFields: Record<string, string | null> = {
      permanent_url: publicUrl,
      bucket: 'user images',
      path: storagePath,
    };
    if (tempUrl) updateFields.temp_url = null;
    if (base64Image) updateFields.base64_image = null;

    const { error: updateError } = await supabase
      .from(table)
      .update(updateFields)
      .eq('id', id);
    if (updateError) {
      console.error('DB update error:', updateError);
      return new Response('Failed to update DB', { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, publicUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unhandled error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}); 
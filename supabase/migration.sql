
-- Create a storage bucket for user images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'user_images', 'User Images', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'user_images'
);

-- Set up RLS policy to allow authenticated users to read their own images
CREATE POLICY IF NOT EXISTS "Users can view their own images" 
ON storage.objects 
FOR SELECT 
USING (auth.uid() = (storage.foldername(name))[1]::uuid);

-- Set up RLS policy to allow authenticated users to insert their own images
CREATE POLICY IF NOT EXISTS "Users can upload their own images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (auth.uid() = (storage.foldername(name))[1]::uuid);

-- Set up RLS policy to allow authenticated users to update their own images
CREATE POLICY IF NOT EXISTS "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (auth.uid() = (storage.foldername(name))[1]::uuid);

-- Set up RLS policy to allow authenticated users to delete their own images
CREATE POLICY IF NOT EXISTS "Users can delete their own images" 
ON storage.objects 
FOR DELETE 
USING (auth.uid() = (storage.foldername(name))[1]::uuid);

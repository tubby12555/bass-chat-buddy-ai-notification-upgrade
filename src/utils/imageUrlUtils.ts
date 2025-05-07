
/**
 * Utility functions for handling image URLs from different sources
 */

/**
 * Check if a URL is a valid Supabase storage URL
 */
export const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  return !!url && url.includes('.supabase.co/storage/');
};

/**
 * Check if a URL is a valid Google Drive URL
 */
export const isValidDriveUrl = (url: string | null | undefined): boolean => {
  return !!url && url.startsWith('https://drive.google.com/');
};

/**
 * Get the most appropriate image URL from an image object
 */
export const getImageUrl = (image: {
  permanent_url: string | null;
  temp_url: string | null;
}): string | null => {
  if (image.permanent_url && isValidSupabaseUrl(image.permanent_url)) return image.permanent_url;
  if (image.temp_url && isValidDriveUrl(image.temp_url)) {
    // Convert Google Drive view URL to direct image URL if needed
    if (image.temp_url.includes('view?usp=sharing')) {
      return image.temp_url.replace('view?usp=sharing', 'preview');
    }
    return image.temp_url;
  }
  return null;
};

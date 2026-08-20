import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * Handles uploading images to Supabase Storage or Mocking it locally
 */
export const storageService = {
  async uploadFoodImage(file, restaurantId) {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${restaurantId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `food-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('food-images')
          .getPublicUrl(filePath);

        return data.publicUrl;
      } catch (err) {
        console.error('Storage Upload Error:', err);
        throw new Error('Failed to upload image to Supabase.');
      }
    }

    // MOCK MODE: Return object URL (Note: Object URLs expire on page reload)
    // To make it persist across reloads in mock mode, we could convert to Base64, 
    // but that bloats localStorage rapidly. We will just return a placeholder 
    // or base64 if it's very small. For demo purposes, we will convert to base64.
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      // Convert to base64 for local persistence
      reader.readAsDataURL(file);
    });
  }
};

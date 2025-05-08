import { useState, useEffect } from 'react';
import { preloadThemeImages, getSlotThemeById, SlotThemeAsset } from './slotAssets';

/**
 * Hook to manage slot asset loading and provide theme information
 */
export function useSlotAssets(themeId: string) {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<SlotThemeAsset | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when themeId changes
    setLoading(true);
    setError(null);

    // Get theme configuration
    const themeConfig = getSlotThemeById(themeId);
    
    if (!themeConfig) {
      setError(`Theme "${themeId}" not found`);
      setLoading(false);
      return;
    }

    setTheme(themeConfig);

    // Preload all theme images
    preloadThemeImages(themeId)
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error preloading images:', err);
        setError('Failed to load theme assets');
        setLoading(false);
      });
  }, [themeId]);

  return { loading, theme, error };
}

export default useSlotAssets;
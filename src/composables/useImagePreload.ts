import { ref, onUnmounted } from 'vue';

/**
 * Composable for preloading images to prevent flickering
 *
 * Usage:
 * const { preloadImages, isLoaded } = useImagePreload();
 * preloadImages(['url1.jpg', 'url2.jpg']);
 */
export function useImagePreload() {
  // Cache of preloaded images
  const preloadedImages = new Map<string, HTMLImageElement>();

  // Set of currently loading images
  const loadingImages = new Set<string>();

  // Reactive map to track loading states
  const loadingStates = ref<Map<string, boolean>>(new Map());

  /**
   * Preload a single image
   * @param url - Image URL to preload
   * @returns Promise that resolves when image is loaded
   */
  const preloadImage = (url: string): Promise<void> => {
    // Skip if empty URL
    if (!url) {
      return Promise.resolve();
    }

    // Return immediately if already preloaded
    if (preloadedImages.has(url)) {
      return Promise.resolve();
    }

    // Return existing promise if currently loading
    if (loadingImages.has(url)) {
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (preloadedImages.has(url) || !loadingImages.has(url)) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 50);
      });
    }

    // Start loading
    loadingImages.add(url);
    loadingStates.value.set(url, false);

    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        preloadedImages.set(url, img);
        loadingImages.delete(url);
        loadingStates.value.set(url, true);
        resolve();
      };

      img.onerror = (error) => {
        loadingImages.delete(url);
        loadingStates.value.set(url, false);
        console.warn(`Failed to preload image: ${url}`, error);
        // Resolve anyway to not block the application
        resolve();
      };

      img.src = url;
    });
  };

  /**
   * Preload multiple images
   * @param urls - Array of image URLs to preload
   * @returns Promise that resolves when all images are loaded
   */
  const preloadImages = (urls: string[]): Promise<void[]> => {
    const validUrls = urls.filter(url => url && url.length > 0);
    return Promise.all(validUrls.map(url => preloadImage(url)));
  };

  /**
   * Check if an image is loaded
   * @param url - Image URL to check
   * @returns true if image is preloaded
   */
  const isLoaded = (url: string): boolean => {
    return preloadedImages.has(url);
  };

  /**
   * Get loading state for a specific image
   * @param url - Image URL to check
   * @returns true if loaded, false if loading or failed
   */
  const getLoadingState = (url: string): boolean => {
    return loadingStates.value.get(url) ?? false;
  };

  /**
   * Clear the preload cache
   */
  const clearCache = () => {
    preloadedImages.clear();
    loadingImages.clear();
    loadingStates.value.clear();
  };

  // Cleanup on unmount
  onUnmounted(() => {
    clearCache();
  });

  return {
    preloadImage,
    preloadImages,
    isLoaded,
    getLoadingState,
    clearCache,
  };
}

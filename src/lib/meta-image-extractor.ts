interface MetaImageData {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

interface ExtractionResult {
  success: boolean;
  imageUrl: string;
  fallbackUsed: boolean;
  error?: string;
  debug?: {
    strategy: string;
    extractedUrl?: string;
    validationPassed?: boolean;
  };
}

/**
 * Check if URL is a Framer website
 */
function isFramerWebsite(url: string): boolean {
  const hostname = new URL(url).hostname.toLowerCase();
  return hostname.includes('framer.app') || 
         hostname.includes('framerusercontent.com') ||
         hostname.includes('framer.website') ||
         hostname.includes('framer.com');
}

/**
 * Extract images from Framer websites using their API
 */
async function extractFramerImage(url: string): Promise<MetaImageData | null> {
  try {
    // console.log(`Extracting Framer image for: ${url}`);
    
    // Framer websites often have og:image in their initial HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      // console.log(`Framer HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    
    // Look for Framer-specific meta tags
    const framerOgRegex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
    const framerOgMatch = framerOgRegex.exec(html);
    if (framerOgMatch?.[1]) {
      const imageUrl = framerOgMatch[1];
      // console.log(`Found Framer OG image: ${imageUrl}`);
      return { url: imageUrl, type: 'framer-og' };
    }

    // Look for Framer's default preview images
    const framerPreviewRegex = /<meta[^>]*name=["']preview-image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
    const framerPreviewMatch = framerPreviewRegex.exec(html);
    if (framerPreviewMatch?.[1]) {
      const imageUrl = framerPreviewMatch[1];
      // console.log(`Found Framer preview image: ${imageUrl}`);
      return { url: imageUrl, type: 'framer-preview' };
    }

    // Look for any image in Framer's asset URLs
    const framerAssetRegex = /https:\/\/framerusercontent\.com\/[^"'\s]+\.(?:png|jpg|jpeg|webp|gif)/i;
    const framerAssetMatch = framerAssetRegex.exec(html);
    if (framerAssetMatch) {
      const imageUrl = framerAssetMatch[0];
      // console.log(`Found Framer asset image: ${imageUrl}`);
      return { url: imageUrl, type: 'framer-asset' };
    }

    // console.log(`No Framer-specific images found`);
    return null;
  } catch (error) {
    console.error('Framer extraction failed:', error);
    return null;
  }
}

/**
 * Extract Open Graph and Twitter Card images from HTML
 * This is our primary method - fast and reliable
 */
async function extractMetaTags(url: string): Promise<MetaImageData | null> {
  try {
    // console.log(`Extracting meta tags from: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // console.log(`HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    // console.log(`HTML length: ${html.length} characters`);
    
    // Extract Open Graph image (highest priority)
    const ogRegex = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
    const ogMatch = ogRegex.exec(html);
    if (ogMatch?.[1]) {
      const ogUrl = ogMatch[1];
      // console.log(`Found Open Graph image: ${ogUrl}`);
      if (ogUrl.startsWith('http')) {
        return { url: ogUrl, type: 'og' };
      } else if (ogUrl.startsWith('/')) {
        const baseUrl = new URL(url);
        const fullUrl = `${baseUrl.origin}${ogUrl}`;
        // console.log(`Converted relative OG URL: ${fullUrl}`);
        return { url: fullUrl, type: 'og' };
      } else if (ogUrl.startsWith('//')) {
        const fullUrl = `https:${ogUrl}`;
        // console.log(`Converted protocol-relative OG URL: ${fullUrl}`);
        return { url: fullUrl, type: 'og' };
      }
    }

    // Extract Twitter Card image
    const twitterRegex = /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;
    const twitterMatch = twitterRegex.exec(html);
    if (twitterMatch?.[1]) {
      const twitterUrl = twitterMatch[1];
      // console.log(`Found Twitter image: ${twitterUrl}`);
      if (twitterUrl.startsWith('http')) {
        return { url: twitterUrl, type: 'twitter' };
      } else if (twitterUrl.startsWith('/')) {
        const baseUrl = new URL(url);
        const fullUrl = `${baseUrl.origin}${twitterUrl}`;
        // console.log(`Converted relative Twitter URL: ${fullUrl}`);
        return { url: fullUrl, type: 'twitter' };
      } else if (twitterUrl.startsWith('//')) {
        const fullUrl = `https:${twitterUrl}`;
        // console.log(`Converted protocol-relative Twitter URL: ${fullUrl}`);
        return { url: fullUrl, type: 'twitter' };
      }
    }

    // Extract Twitter Card image (alternative format)
    const twitterImageRegex = /<meta[^>]*name=["']twitter:image:src["'][^>]*content=["']([^"']+)["'][^>]*>/i;
    const twitterImageMatch = twitterImageRegex.exec(html);
    if (twitterImageMatch?.[1]) {
      const twitterImageUrl = twitterImageMatch[1];
      // console.log(`Found Twitter image:src: ${twitterImageUrl}`);
      if (twitterImageUrl.startsWith('http')) {
        return { url: twitterImageUrl, type: 'twitter' };
      } else if (twitterImageUrl.startsWith('/')) {
        const baseUrl = new URL(url);
        const fullUrl = `${baseUrl.origin}${twitterImageUrl}`;
        // console.log(`Converted relative Twitter image:src URL: ${fullUrl}`);
        return { url: fullUrl, type: 'twitter' };
      } else if (twitterImageUrl.startsWith('//')) {
        const fullUrl = `https:${twitterImageUrl}`;
        // console.log(`Converted protocol-relative Twitter image:src URL: ${fullUrl}`);
        return { url: fullUrl, type: 'twitter' };
      }
    }

    // Look for large images in the page (fallback strategy)
    const imgMatches = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
    if (imgMatches) {
      // console.log(`Found ${imgMatches.length} images in page`);
      const baseUrl = new URL(url);
      const images = imgMatches
        .map(match => {
          const srcRegex = /src=["']([^"']+)["']/i;
          const srcMatch = srcRegex.exec(match);
          return srcMatch?.[1] ?? null;
        })
        .filter(src => src && !src.includes('icon') && !src.includes('logo') && !src.includes('avatar'))
        .map(src => {
          if (src?.startsWith('http')) return src;
          if (src?.startsWith('/')) return `${baseUrl.origin}${src}`;
          if (src?.startsWith('//')) return `https:${src}`;
          return null;
        })
        .filter(src => src);

      // console.log(`Found ${images.length} valid page images`);
      // Return the first valid image
      if (images.length > 0) {
        // console.log(`Using page image: ${images[0]}`);
        return { url: images[0]!, type: 'page-image' };
      }
    }

    // console.log(`No meta images found in HTML`);

  } catch (error) {
    console.error('Meta tag extraction failed:', error);
  }
  
  return null;
}

/**
 * Generate unavailable state (no fallback images)
 */
function generateUnavailableState(): MetaImageData {
  return {
    url: '', // Empty URL to indicate no image
    type: 'unavailable'
  };
}

/**
 * Validate if an image URL is accessible and returns an image
 */
async function validateImageUrl(imageUrl: string): Promise<boolean> {
  try {
    // console.log(`Validating image URL: ${imageUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const contentType = response.headers.get('content-type');
    const isValid = contentType?.startsWith('image/') ?? false;
    
    // console.log(`Image validation result: ${isValid} (${contentType})`);
    return isValid;
  } catch (error) {
    console.error(`Image validation failed:`, error);
    return false;
  }
}

/**
 * Main function to extract meta image with enhanced strategies
 */
export async function extractMetaImage(url: string): Promise<ExtractionResult> {
  // console.log(`Starting enhanced meta image extraction for: ${url}`);
  
  try {
    // Strategy 1: Framer-specific extraction (if it's a Framer site)
    if (isFramerWebsite(url)) {
      // console.log(`Detected Framer website, using Framer-specific extraction`);
      const framerResult = await extractFramerImage(url);
      if (framerResult) {
        // console.log(`Extracted Framer image: ${framerResult.url} (${framerResult.type})`);
        
        // Validate the extracted image
        const isValid = await validateImageUrl(framerResult.url);
        if (isValid) {
          // console.log(`Framer image validation passed`);
          return {
            success: true,
            imageUrl: framerResult.url,
            fallbackUsed: false,
            debug: {
              strategy: 'framer-specific',
              extractedUrl: framerResult.url,
              validationPassed: true
            }
          };
        } else {
          // console.log(`Framer image validation failed, trying standard extraction`);
        }
      }
    }

    // Strategy 2: Extract meta tags from HTML (fastest and most reliable)
    const metaResult = await extractMetaTags(url);
    if (metaResult) {
      // console.log(`Extracted meta image: ${metaResult.url} (${metaResult.type})`);
      
      // Validate the extracted image
      const isValid = await validateImageUrl(metaResult.url);
      if (isValid) {
        // console.log(`Meta image validation passed`);
        return {
          success: true,
          imageUrl: metaResult.url,
          fallbackUsed: false,
          debug: {
            strategy: 'meta-tags',
            extractedUrl: metaResult.url,
            validationPassed: true
          }
        };
      } else {
        // console.log(`Meta image validation failed, using unavailable state`);
      }
    }

    // Strategy 3: Use unavailable state (no fallback images)
    const unavailableResult = generateUnavailableState();
    // console.log(`🔄 Using unavailable state (no fallback images)`);
    
    return {
      success: true,
      imageUrl: unavailableResult.url,
      fallbackUsed: true,
      debug: {
        strategy: 'unavailable',
        extractedUrl: unavailableResult.url,
        validationPassed: false
      }
    };

  } catch (error) {
    console.error('Meta image extraction failed:', error);
    
    // Final fallback - unavailable state
    const unavailableResult = generateUnavailableState();
    return {
      success: false,
      imageUrl: unavailableResult.url,
      fallbackUsed: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        strategy: 'error-unavailable',
        extractedUrl: unavailableResult.url,
        validationPassed: false
      }
    };
  }
}

/**
 * Batch extract meta images for multiple URLs
 */
export async function extractMetaImages(urls: string[]): Promise<Map<string, ExtractionResult>> {
  const results = new Map<string, ExtractionResult>();
  
  // Process URLs in parallel with concurrency limit
  const concurrencyLimit = 5;
  const chunks = [];
  
  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    chunks.push(urls.slice(i, i + concurrencyLimit));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(async (url) => {
      const result = await extractMetaImage(url);
      return { url, result };
    });
    
    const chunkResults = await Promise.all(promises);
    chunkResults.forEach(({ url, result }) => {
      results.set(url, result);
    });
  }
  
  return results;
}

/**
 * Wrapper function to extract just the image URL
 * Returns the image URL string directly
 */
export async function extractImageUrl(url: string): Promise<string> {
  const result = await extractMetaImage(url);
  return result.imageUrl;
}
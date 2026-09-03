/**
 * Utility functions to parse, embed, and launch third-party videos
 * Supports YouTube, TikTok, Facebook, Google Drive, and direct MP4/WebM video links.
 */

export interface ParsedVideoInfo {
  platform: 'youtube' | 'tiktok' | 'facebook' | 'googledrive' | 'direct' | 'other';
  embedUrl: string;
  directUrl: string;
  thumbnailUrl?: string;
  canEmbedInIframe: boolean;
  platformDisplayName: string;
}

export function parseVideoInfo(inputUrl: string, fallbackThumbnail?: string): ParsedVideoInfo {
  const url = (inputUrl || '').trim();

  if (!url) {
    return {
      platform: 'other',
      embedUrl: '',
      directUrl: '',
      thumbnailUrl: fallbackThumbnail || '',
      canEmbedInIframe: false,
      platformDisplayName: 'Video',
    };
  }

  // 1. YouTube detection
  // Supports formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      platform: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`,
      directUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: fallbackThumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      canEmbedInIframe: true,
      platformDisplayName: 'YouTube',
    };
  }

  // 2. Google Drive
  // https://drive.google.com/file/d/ID/view -> https://drive.google.com/file/d/ID/preview
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const driveId = driveMatch[1];
    return {
      platform: 'googledrive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      directUrl: `https://drive.google.com/file/d/${driveId}/view`,
      thumbnailUrl: fallbackThumbnail || '',
      canEmbedInIframe: true,
      platformDisplayName: 'Google Drive',
    };
  }

  // 3. Direct video format (.mp4, .webm, .ogg, .mov)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return {
      platform: 'direct',
      embedUrl: url,
      directUrl: url,
      thumbnailUrl: fallbackThumbnail || '',
      canEmbedInIframe: true,
      platformDisplayName: 'Video File',
    };
  }

  // 4. TikTok detection
  // e.g. https://www.tiktok.com/@user/video/1234567890 or https://vt.tiktok.com/...
  if (url.includes('tiktok.com')) {
    const ttIdMatch = url.match(/video\/(\d+)/i);
    const ttId = ttIdMatch ? ttIdMatch[1] : '';
    return {
      platform: 'tiktok',
      embedUrl: ttId ? `https://www.tiktok.com/embed/v2/${ttId}` : url,
      directUrl: url,
      thumbnailUrl: fallbackThumbnail || '',
      canEmbedInIframe: false, // TikTok X-Frame-Options blocks most third party embedding
      platformDisplayName: 'TikTok',
    };
  }

  // 5. Facebook detection
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return {
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
      directUrl: url,
      thumbnailUrl: fallbackThumbnail || '',
      canEmbedInIframe: true,
      platformDisplayName: 'Facebook',
    };
  }

  // 6. Generic or preexisting embed url
  const isEmbed = url.includes('/embed/') || url.includes('/player/');
  return {
    platform: 'other',
    embedUrl: url,
    directUrl: url,
    thumbnailUrl: fallbackThumbnail || '',
    canEmbedInIframe: isEmbed,
    platformDisplayName: 'Trình duyệt video',
  };
}

/**
 * Safely open a video URL in a new tab or app.
 */
export function openExternalVideo(url: string) {
  if (!url) return;
  const parsed = parseVideoInfo(url);
  const targetUrl = parsed.directUrl || parsed.embedUrl || url;
  window.open(targetUrl, '_blank', 'noopener,noreferrer');
}

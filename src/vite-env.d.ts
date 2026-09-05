/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;

  // Google Gemini API
  readonly GEMINI_API_KEY: string;

  // App URL
  readonly APP_URL: string;

  // Analytics
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_GTM_ID: string;
  readonly VITE_META_PIXEL_ID: string;

  // Legacy (cho storageService.ts fallback)
  readonly VITE_USE_REMOTE_STORAGE: string;
  readonly VITE_USE_CLOUDINARY_UPLOAD: string;
  readonly VITE_USE_GOOGLE_FORM_LEAD: string;
  readonly VITE_FALLBACK_TO_LOCAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

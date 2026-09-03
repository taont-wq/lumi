/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JSONBIN_MASTER_KEY: string;
  readonly VITE_JSONBIN_BIN_PROJECTS: string;
  readonly VITE_JSONBIN_BIN_APARTMENTS: string;
  readonly VITE_JSONBIN_BIN_LEADS: string;
  readonly VITE_JSONBIN_BIN_SETTINGS: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_GOOGLE_FORM_ID: string;
  readonly VITE_GOOGLE_FORM_FIELD_PHONE: string;
  readonly VITE_GOOGLE_FORM_FIELD_NAME: string;
  readonly VITE_GOOGLE_FORM_FIELD_EMAIL: string;
  readonly VITE_GOOGLE_FORM_FIELD_PROJECT: string;
  readonly VITE_GOOGLE_FORM_FIELD_UNITCODE: string;
  readonly VITE_GOOGLE_FORM_FIELD_UNITTYPE: string;
  readonly VITE_GOOGLE_FORM_FIELD_ACTION: string;
  readonly VITE_GOOGLE_FORM_FIELD_NOTE: string;
  readonly VITE_GOOGLE_FORM_FIELD_TIMESTAMP: string;
  readonly VITE_USE_REMOTE_STORAGE: string;
  readonly VITE_USE_CLOUDINARY_UPLOAD: string;
  readonly VITE_USE_GOOGLE_FORM_LEAD: string;
  readonly VITE_FALLBACK_TO_LOCAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

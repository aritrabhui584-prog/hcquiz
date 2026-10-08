export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

// Safely extract environment variables across browser, Vite, and Node.js runtimes
const envApiKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_API_KEY || process.env?.FIREBASE_API_KEY)) ||
  '';

const envProjectId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_PROJECT_ID || process.env?.FIREBASE_PROJECT_ID)) ||
  '';

const envAppId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_APP_ID || process.env?.FIREBASE_APP_ID)) ||
  '';

const envAuthDomain =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_AUTH_DOMAIN || process.env?.FIREBASE_AUTH_DOMAIN)) ||
  '';

const envDbId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DATABASE_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_DATABASE_ID || process.env?.FIREBASE_DATABASE_ID)) ||
  '(default)';

const envStorageBucket =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_STORAGE_BUCKET || process.env?.FIREBASE_STORAGE_BUCKET)) ||
  '';

const envSenderId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env?.FIREBASE_MESSAGING_SENDER_ID)) ||
  '';

const envOAuthClientId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_OAUTH_CLIENT_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_OAUTH_CLIENT_ID || process.env?.FIREBASE_OAUTH_CLIENT_ID)) ||
  '';

export const firebaseConfig: FirebaseAppConfig = {
  projectId: envProjectId,
  appId: envAppId,
  apiKey: envApiKey,
  authDomain: envAuthDomain,
  firestoreDatabaseId: envDbId,
  storageBucket: envStorageBucket,
  messagingSenderId: envSenderId,
  measurementId: '',
  oAuthClientId: envOAuthClientId,
  recaptchaSiteKey: '',
};

export default firebaseConfig;

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
  'AIzaSyA00000000000000000000000000000000';

const envProjectId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_PROJECT_ID || process.env?.FIREBASE_PROJECT_ID)) ||
  'scientific-water-hn2tx';

const envAppId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_APP_ID || process.env?.FIREBASE_APP_ID)) ||
  '1:353630369099:web:516aae654e0845eab1e4ce';

const envAuthDomain =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_AUTH_DOMAIN || process.env?.FIREBASE_AUTH_DOMAIN)) ||
  'scientific-water-hn2tx.firebaseapp.com';

const envDbId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_DATABASE_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_DATABASE_ID || process.env?.FIREBASE_DATABASE_ID)) ||
  'ai-studio-8637faba-02f3-4bac-bab2-1ea47cf71705';

const envStorageBucket =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_STORAGE_BUCKET || process.env?.FIREBASE_STORAGE_BUCKET)) ||
  'scientific-water-hn2tx.firebasestorage.app';

const envSenderId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env?.FIREBASE_MESSAGING_SENDER_ID)) ||
  '353630369099';

const envOAuthClientId =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_OAUTH_CLIENT_ID) ||
  (typeof process !== 'undefined' && (process.env?.VITE_FIREBASE_OAUTH_CLIENT_ID || process.env?.FIREBASE_OAUTH_CLIENT_ID)) ||
  '353630369099-m5ev80ptsopmqmhns550gfi3jef8lilt.apps.googleusercontent.com';

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

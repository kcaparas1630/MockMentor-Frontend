/**
 * @fileoverview Firebase authentication configuration and initialization for the AI Interview Frontend.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as the Firebase configuration and authentication setup for the application.
 * It initializes the Firebase app with environment-based configuration, sets up authentication
 * services, and exports the auth instance for use throughout the application. It plays a crucial
 * role in user authentication, OAuth integration, and session management.
 *
 * @see {@link src/Components/Auth/LoginForm.tsx}
 * @see {@link src/Components/Auth/SignUpForm.tsx}
 * @see {@link src/Components/AuthGuard.tsx}
 *
 * Dependencies:
 * - Firebase App
 * - Firebase Auth
 * - Environment variables
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

/**
 * Firebase configuration object using environment variables.
 * @constant {object} firebaseConfig - Firebase project configuration.
 * @property {string} apiKey - Firebase API key from environment.
 * @property {string} authDomain - Firebase auth domain from environment.
 * @property {string} projectId - Firebase project ID from environment.
 * @property {string} storageBucket - Firebase storage bucket from environment.
 * @property {string} messagingSenderId - Firebase messaging sender ID from environment.
 * @property {string} appId - Firebase app ID from environment.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Initialized Firebase app instance.
 * @constant {FirebaseApp} app - Firebase application instance.
 */
const app = initializeApp(firebaseConfig);

/**
 * Firebase authentication instance for the application.
 * @constant {Auth} auth - Firebase Auth instance for authentication operations.
 */
const auth = getAuth(app);

export { auth, app };

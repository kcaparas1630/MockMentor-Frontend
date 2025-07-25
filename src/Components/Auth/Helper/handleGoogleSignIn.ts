/**
 * @fileoverview Google OAuth authentication helper function that handles Firebase Google sign-in popup.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a utility function for Google OAuth authentication using Firebase Auth.
 * It manages the Google sign-in popup flow, handles authentication errors, and provides
 * user-friendly error messages. It plays a crucial role in the OAuth authentication flow
 * and is used by both login and signup components.
 *
 * @see {@link src/Components/Auth/LoginForm.tsx}
 * @see {@link src/Components/Auth/SignUpForm.tsx}
 * @see {@link src/Firebase/FirebaseAuth.ts}
 * @see {@link src/Types/Firebase/FirebaseError.ts}
 *
 * Dependencies:
 * - Firebase Auth
 * - Google Auth Provider
 */

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/Firebase/FirebaseAuth";
import isFirebaseAuthError from "@/Types/Firebase/FirebaseError";
import axios from "axios";
import tokenStorage from "@/Utils/TokenStorage";
/**
 * Initiates Google OAuth sign-in using Firebase Auth popup.
 *
 * @function
 * @returns {Promise<User>} Firebase User object after successful authentication.
 * Example Return Value: `{ uid: "123", email: "user@gmail.com", displayName: "John Doe" }`
 * @example
 * // Example usage in components:
 * const user = await handleGoogleSignIn();
 * console.log(user.email);
 *
 * @throws {Error} Throws user-friendly error messages for authentication failures.
 * @remarks
 * Side Effects: 
 * - Opens Google OAuth popup window
 * - Authenticates user with Firebase
 * - May trigger browser permission requests
 *
 * Known Issues/Limitations:
 * - Popup may be blocked by browser popup blockers
 * - Limited error handling for network issues
 * - No offline fallback mechanism
 *
 * Design Decisions/Rationale:
 * - Uses popup instead of redirect for better UX
 * - Provides specific error messages for common failures
 * - Wraps Firebase errors in user-friendly messages
 * - Returns Firebase User object for consistency
 */
const handleGoogleSignIn = async (baseUrl: string) => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    GoogleAuthProvider.credentialFromResult(result);

    // Get ID token from the authenticated user.
    const idToken = await result.user.getIdToken();
    
    // Store token securely for future API calls
    await tokenStorage.storeToken(idToken, 3600); // 1 hour expiry
    
    // Send this ID token to your backend for session management.
    axios.post(`${baseUrl}/api/google`, { idToken });
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Authentication was cancelled");
      } else if (error.code === "auth/user-not-found") {
        throw new Error("No user found with this email. Please sign up first.");
      } else {
        throw new Error("Failed to sign in with Google. Please try again.");
      }
    } else {
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
};

export default handleGoogleSignIn;

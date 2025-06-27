import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/Firebase/FirebaseAuth";
import isFirebaseAuthError from "@/Types/Firebase/FirebaseError";

const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: unknown) {
    if (isFirebaseAuthError(error)) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Authentication was cancelled");
      } else {
        throw new Error("Failed to sign in with Google. Please try again.");
      }
    } else {
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }
};

export default handleGoogleSignIn;

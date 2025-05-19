import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../../Firebase/FirebaseAuth";
import isFirebaseAuthError from "../../../Types/Firebase/FirebaseError";
import { Dispatch, SetStateAction } from "react";
type HandleGoogleSignInProps = {
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setAuthError: Dispatch<SetStateAction<string | null>>;
}

const handleGoogleSignIn = async ({ setIsLoading, setAuthError }: HandleGoogleSignInProps) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("User signed in with Google");
    } catch (error: unknown) {
      if (isFirebaseAuthError(error)) {
        if (error.code === "auth/popup-closed-by-user") {
          setAuthError("Authentication was cancelled");
        } else {
          setAuthError("Failed to sign in with Google. Please try again.");
        }
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  export default handleGoogleSignIn;

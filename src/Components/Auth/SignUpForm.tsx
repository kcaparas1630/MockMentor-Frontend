import { useState } from "react";
import {
  SignUpContainer,
  Title,
  Description,
  Form,
  SignInLink,
  GoogleButton,
  Divider,
  ErrorMessage,
} from "./Styles/StyledAuth";
import ReusableButton from "../../Commons/Button";
import GoogleIcon from "../../Assets/GoogleIcon";
import isFirebaseAuthError from "../../Types/Firebase/FirebaseError";
import ReusableInput from "../../Commons/ReuasbleInputField";
import { auth } from "../../Firebase/FirebaseAuth";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const SignUpForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully");
      // will create an error type for the error
    } catch (error: unknown) {
      if (isFirebaseAuthError(error)) {
        // handle specific firebase errors
        if (error.code === "auth/email-already-in-use") {
          setAuthError("Email already in use");
        } else if (error.code === "auth/invalid-email") {
          setAuthError("Invalid email address");
        } else if (error.code === "auth/weak-password") {
          setAuthError("Password must be at least 6 characters long");
        } else {
          setAuthError(
            error.message || "Failed to create account. Please try again."
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    //TODO: Implement Google sign in logic
    setIsLoading(true);
    setAuthError(null);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      console.log("User signed in with Google");
    } catch (error: unknown) {
      if (isFirebaseAuthError(error)) {
        setAuthError(error.message);
      } else {
        setAuthError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignUpContainer>
      <Title>Create an account</Title>
      <Description>Enter your email below to create your account</Description>
      <Form onSubmit={handleSignUp}>
        <ReusableInput
          type="email"
          placeholder="Email"
          label="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <ReusableInput
          type="password"
          placeholder="Password"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {authError && <ErrorMessage>{authError}</ErrorMessage>}
        <ReusableButton
          type="submit"
          color="primary"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up with Email"}
        </ReusableButton>
      </Form>
      <Divider>or continue with</Divider>
      <GoogleButton type="button" onClick={handleGoogleSignIn}>
        <GoogleIcon />
        Sign in with Google
      </GoogleButton>
      <SignInLink>
        Already have an account? <span>Sign in</span>
      </SignInLink>
    </SignUpContainer>
  );
};

export default SignUpForm;

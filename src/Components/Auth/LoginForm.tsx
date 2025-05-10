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

const LoginForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully");
      // will create an error type for the error
    } catch (error: unknown) {
      if (isFirebaseAuthError(error)) {
        if (error.code === "auth/user-not-found") {
          setAuthError("Email or password is incorrect.");
        } else {
          setAuthError(
            `${error.message || "Failed to find account. Please try again."}`
          );
        }
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
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

  return (
    <SignUpContainer>
      <Title>Login to your account</Title>
      <Description>Enter your email below to login to your account</Description>
      <Form onSubmit={handleLogIn}>
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
          {isLoading ? "Logging in..." : "Sign In with Email"}
        </ReusableButton>
      </Form>
      <Divider>or continue with</Divider>
      <GoogleButton type="button" onClick={handleGoogleSignIn}>
        <GoogleIcon />
        Sign in with Google
      </GoogleButton>
      <SignInLink>
        Don't have an account? <span>Sign Up</span>
      </SignInLink>
    </SignUpContainer>
  );
};

export default LoginForm;

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
  StyledLink,
} from "./Styles/StyledAuth";
import ReusableButton from "../../Commons/Button";
import GoogleIcon from "../../Assets/GoogleIcon";
import isFirebaseAuthError from "../../Types/Firebase/FirebaseError";
import ReusableInput from "../../Commons/ReuasbleInputField";
import { auth } from "../../Firebase/FirebaseAuth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import handleGoogleSignIn from "./Helper/handleGoogleSignIn";
import { useMutation } from "@tanstack/react-query";

const SignUpForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    //TODO: create a mutation for the sign up

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("User created successfully");
      // will create an error type for the error
    } catch (error: unknown) {
      if (isFirebaseAuthError(error)) {
        if (error.code === "auth/email-already-in-use") {
          setAuthError("Email already in use");
        } else if (error.code === "auth/invalid-email") {
          setAuthError("Invalid email address");
        } else if (error.code === "auth/password-does-not-meet-requirements") {
          setAuthError(
            "Password must: \n" +
              "• Contain at least 8 characters\n" +
              "• Include an uppercase character\n" +
              "• Include a numeric character\n" +
              "• Include a special character"
          );
        } else {
          setAuthError(
            `${error.message || "Failed to create account. Please try again."}`
          );
        }
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignInMutation = useMutation({
    mutationFn: handleGoogleSignIn,
    onSuccess: () => {
      //TODO: redirect to dashboard.
    },
    onError: (error: unknown) => {
      if (isFirebaseAuthError(error)) {
        setAuthError(error.message);
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
      }
    }
  })
  return (
    <SignUpContainer>
      <ToastContainer />
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
      <GoogleButton
        type="button"
        onClick={() => googleSignInMutation.mutate()}
        disabled={googleSignInMutation.isPending}
      >
        {googleSignInMutation.isPending ? "Signing in with Google..." : (
          <>
            <GoogleIcon />
            Sign in with Google
          </>
        )}
      </GoogleButton>
      <SignInLink>
        Already have an account? <StyledLink to="/login">Sign in</StyledLink>
      </SignInLink>
    </SignUpContainer>
  );
};

export default SignUpForm;

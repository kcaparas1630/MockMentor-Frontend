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
import ReusableInput from "../../Commons/ReusableInputField";
import { auth } from "../../Firebase/FirebaseAuth";
import { signInWithEmailAndPassword } from "firebase/auth";
import handleGoogleSignIn from "./Helper/handleGoogleSignIn";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";

const loginUser = async (credentials: { email: string, password: string }) => {
  const { email, password } = credentials;
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();
  
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  })
  const user = response.data;
  return user;
}

const LoginForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      navigate({ to: "/profile-create" });
    },
    onError: (error: unknown) => {
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
    },
    onSettled: () => {
      setIsLoading(false);
    }
  })

  const googleSignInMutation = useMutation({
    mutationFn: handleGoogleSignIn,
    onSuccess: () => {
      navigate({ to: "/profile-create" });
    },
    onError: (error: unknown) => {
      if (isFirebaseAuthError(error)) {
        setAuthError(error.message);
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
      }
    }
  })

  const handleLogIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    mutation.mutate({ email, password });
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
        Don't have an account? <StyledLink to="/SignUp">Sign Up</StyledLink>
      </SignInLink>
    </SignUpContainer>
  );
};

export default LoginForm;

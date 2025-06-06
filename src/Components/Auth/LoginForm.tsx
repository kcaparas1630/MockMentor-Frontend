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
import { GetUserQuery } from "../../Hooks/UserHooks";

const loginUser = async (credentials: { email: string, password: string }) => {
  const { email, password } = credentials;
  // Step 1: Authenticate with Firebase (handle auth errors immediately)
  const idToken = await AuthenticateUser(email, password);

  // Step 2: Fetch user data from API
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  })
  const user = response.data;
  return user;
}

const AuthenticateUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return idToken;
  } catch (error) {
    if (isFirebaseAuthError(error)) {
      switch (error.code) {
        case "auth/invalid-credential":
          throw new Error("Email or password is incorrect.");
        default:
          throw new Error("An unexpected error occurred. Please try again.");
      }
    }
    
  }
}

const LoginForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { users } = GetUserQuery();
  const navigate = useNavigate();
 
  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      if (users?.profile?.name && users?.profile?.jobRole) {
        // TODO: navigate to dashboard.
        // navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/profile-create" });
      }
    },
    onError: (error: unknown) => {
      console.log(error);
      setAuthError(error instanceof Error ? error.message : String(error));
    },
    onSettled: () => {
      setIsLoading(false);
    }
  })

  const googleSignInMutation = useMutation({
    mutationFn: handleGoogleSignIn,
    onSuccess: () => {
      
      if (users?.profile?.name && users?.profile?.jobRole) {
        // TODO: navigate to dashboard.
        // navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/profile-create" });
      }
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

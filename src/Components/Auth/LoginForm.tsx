/**
 * @fileoverview User login form component that handles email/password authentication and Google OAuth sign-in.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as the primary user authentication interface, providing both traditional email/password
 * login and Google OAuth integration. It handles Firebase authentication, fetches user data from the API,
 * and manages navigation based on user profile completion status. It plays a crucial role in the user
 * authentication flow and post-login navigation logic.
 *
 * @see {@link src/Components/Auth/Helper/handleGoogleSignIn.ts}
 * @see {@link src/Firebase/FirebaseAuth.ts}
 * @see {@link src/Hooks/UserHooks.ts}
 * @see {@link src/Types/Firebase/FirebaseError.ts}
 *
 * Dependencies:
 * - React
 * - React Query
 * - Firebase Auth
 * - Axios
 * - TanStack Router
 */

import { useState, useEffect } from "react";
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
import ReusableButton from "@/Commons/Button";
import GoogleIcon from "@/Assets/GoogleIcon";
import isFirebaseAuthError from "@/Types/Firebase/FirebaseError";
import ReusableInput from "@/Commons/ReusableInputField";
import { auth } from "@/Firebase/FirebaseAuth";
import { signInWithEmailAndPassword } from "firebase/auth";
import handleGoogleSignIn from "./Helper/handleGoogleSignIn";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "@tanstack/react-router";
import { GetUserQuery } from "@/Hooks/UserHooks";

const baseUrl = import.meta.env.VITE_EXPRESS_URL || 'http://localhost:3000';

/**
 * Authenticates user with Firebase using email and password credentials.
 *
 * @function
 * @param {string} email - User's email address.
 * Constraints/Format: Must be a valid email format
 * @param {string} password - User's password.
 * Constraints/Format: Must match registered password
 * @returns {Promise<string>} Firebase ID token for API authentication.
 * Example Return Value: `"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."`
 * @example
 * // Example usage:
 * const token = await AuthenticateUser("user@example.com", "password123");
 * console.log(token);
 *
 * @throws {Error} Throws if authentication fails with specific error messages.
 * @remarks
 * Side Effects: Authenticates with Firebase Auth service.
 *
 * Known Issues/Limitations:
 * - Limited error handling for Firebase auth errors
 * - No password validation on client side
 *
 * Design Decisions/Rationale:
 * - Uses Firebase Auth for secure authentication
 * - Returns ID token for subsequent API calls
 * - Provides user-friendly error messages
 */
const AuthenticateUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
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
};

/**
 * Performs complete login process including Firebase auth and user data fetching.
 *
 * @function
 * @param {object} credentials - User login credentials.
 * @param {string} credentials.email - User's email address.
 * Constraints/Format: Must be a valid email format
 * @param {string} credentials.password - User's password.
 * Constraints/Format: Must match registered password
 * @returns {Promise<object>} User data from API.
 * Example Return Value: `{ id: "123", email: "user@example.com", profile: {...} }`
 * @example
 * // Example usage:
 * const user = await loginUser({ email: "user@example.com", password: "password123" });
 * console.log(user);
 *
 * @throws {Error} Throws if authentication or API call fails.
 * @remarks
 * Side Effects: 
 * - Authenticates with Firebase
 * - Makes API call to fetch user data
 *
 * Known Issues/Limitations:
 * - Hardcoded API endpoint URL
 * - No retry logic for failed requests
 *
 * Design Decisions/Rationale:
 * - Two-step process: Firebase auth then API call
 * - Uses ID token for secure API communication
 * - Returns complete user data for state management
 */
const loginUser = async (credentials: { email: string; password: string }) => {
  const { email, password } = credentials;
  // Step 1: Authenticate with Firebase (handle auth errors immediately)
  const idToken = await AuthenticateUser(email, password);
  if (!idToken) {
    throw new Error("Authentication failed. Please check your credentials.");
  }

  // Step 2: Fetch user data from API
  const response = await axios.get(`${baseUrl}/api/user`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  const user = response.data;
  return user;
};

/**
 * User login form component with email/password and Google OAuth authentication options.
 *
 * @component
 * @returns {JSX.Element} The rendered login form with validation and navigation logic.
 * @example
 * // Usage in routing:
 * <LoginForm />
 *
 * @throws {Error} Renders error messages for authentication failures.
 * @remarks
 * Side Effects: 
 * - Authenticates with Firebase
 * - Fetches user data from API
 * - Navigates based on profile completion
 * - Updates query cache
 *
 * Known Issues/Limitations:
 * - No remember me functionality
 * - No password reset option
 * - Navigation logic could be more robust
 *
 * Design Decisions/Rationale:
 * - Uses React Query for server state management
 * - Implements conditional navigation based on profile status
 * - Separates authentication logic into helper functions
 * - Uses reusable components for consistent UI
 */
const LoginForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { users, refetch, status } = GetUserQuery();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // UseEffect to always fetch user data on user change.
  useEffect(() => {
    if (status === "success" && users) {
     if (users?.profile?.name && users?.profile?.jobRole) {
        navigate({ to: "/video-test" });
      } else {
        navigate({ to: "/profile-create" });
      }
    }
  }, [status, users, navigate]);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: unknown) => {
      setAuthError(error instanceof Error ? error.message : String(error));
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const googleSignInMutation = useMutation({
    mutationFn: handleGoogleSignIn,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      await refetch();
      if (
        status === "success" &&
        users?.profile?.name &&
        users?.profile?.jobRole
      ) {
        navigate({ to: "/video-test" });
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
    },
  });

  /**
   * Handles form submission for email/password login.
   *
   * @function
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event.
   * @returns {Promise<void>} Initiates login process.
   * @example
   * // Called automatically on form submit:
   * <form onSubmit={handleLogIn}>
   *
   * @throws {Error} Sets authError state if login fails.
   * @remarks
   * Side Effects: 
   * - Sets loading state
   * - Clears previous errors
   * - Triggers login mutation
   */
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
        onClick={() => googleSignInMutation.mutate(baseUrl)}
        disabled={googleSignInMutation.isPending}
      >
        {googleSignInMutation.isPending ? (
          "Signing in with Google..."
        ) : (
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

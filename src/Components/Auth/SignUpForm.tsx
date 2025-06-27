/**
 * @fileoverview User registration form component that handles email/password signup and Google OAuth authentication.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as the primary user registration interface, providing both traditional email/password
 * signup and Google OAuth integration. It handles form validation, API communication for user creation,
 * and manages authentication state. It plays a crucial role in the user onboarding process and
 * authentication flow.
 *
 * @see {@link src/Components/Auth/Helper/handleGoogleSignIn.ts}
 * @see {@link src/Commons/Button.tsx}
 * @see {@link src/Commons/ReusableInputField.tsx}
 * @see {@link src/Types/ApiResponse.ts}
 *
 * Dependencies:
 * - React
 * - React Query
 * - Axios
 * - React Toastify
 * - Firebase Auth
 */

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
import ReusableButton from "@/Commons/Button";
import GoogleIcon from "@/Assets/GoogleIcon";
import ReusableInput from "@/Commons/ReusableInputField";
import { ToastContainer, toast } from "react-toastify";
import handleGoogleSignIn from "./Helper/handleGoogleSignIn";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  SuccessResponse,
  ErrorResponse,
  UserRegistrationData,
} from "../../Types/ApiResponse";

/**
 * Registers a new user with the backend API using email and password credentials.
 *
 * @function
 * @param {object} credentials - User registration credentials.
 * @param {string} credentials.email - User's email address.
 * Constraints/Format: Must be a valid email format
 * @param {string} credentials.password - User's password.
 * Constraints/Format: Must meet backend password requirements
 * @returns {Promise<SuccessResponse>} API response indicating registration success.
 * Example Return Value: `{ success: true, message: "User created successfully" }`
 * @example
 * // Example usage:
 * const result = await registerUser({ email: "user@example.com", password: "securepass123" });
 * console.log(result);
 *
 * @throws {AxiosError} Throws if API request fails or user already exists.
 * @remarks
 * Side Effects: Makes HTTP POST request to backend API endpoint.
 *
 * Known Issues/Limitations:
 * - Hardcoded API endpoint URL
 * - No client-side password validation
 *
 * Design Decisions/Rationale:
 * - Uses axios for HTTP requests with proper error handling
 * - Returns structured response for consistent error handling
 */
const registerUser = async (credentials: {
  email: string;
  password: string;
}) => {
  const { email, password } = credentials;
  const response = await axios.post("http://localhost:3000/api/create-user", {
    email,
    password,
  });

  return response.data;
};

/**
 * User registration form component with email/password and Google OAuth signup options.
 *
 * @component
 * @returns {JSX.Element} The rendered signup form with validation and error handling.
 * @example
 * // Usage in App.tsx or routing:
 * <SignUpForm />
 *
 * @throws {Error} Renders error messages for authentication failures.
 * @remarks
 * Side Effects: 
 * - Makes API calls for user registration
 * - Initiates Google OAuth popup
 * - Shows toast notifications
 * - Updates authentication state
 *
 * Known Issues/Limitations:
 * - No password strength validation
 * - No email format validation on client side
 * - Google OAuth redirect handling needs improvement
 *
 * Design Decisions/Rationale:
 * - Uses React Query mutations for server state management
 * - Implements toast notifications for user feedback
 * - Separates Google OAuth logic into helper function
 * - Uses reusable components for consistent UI
 */
const SignUpForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mutation = useMutation<
    SuccessResponse,
    AxiosError<ErrorResponse>,
    UserRegistrationData
  >({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("User created successfully");
    },
    onError: (error) => {
      if (error.response?.data.message) {
        setAuthError(error.response?.data.message);
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const googleSignInMutation = useMutation({
    mutationFn: handleGoogleSignIn,
    onSuccess: () => {
      //TODO: redirect to dashboard.
    },
    onError: (error) => {
      setAuthError(error.message);
    },
  });

  /**
   * Handles form submission for email/password registration.
   *
   * @function
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event.
   * @returns {Promise<void>} Initiates user registration process.
   * @example
   * // Called automatically on form submit:
   * <form onSubmit={handleSignUp}>
   *
   * @throws {Error} Sets authError state if registration fails.
   * @remarks
   * Side Effects: 
   * - Sets loading state
   * - Clears previous errors
   * - Triggers registration mutation
   */
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    mutation.mutate({ email, password });
  };
  
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
        Already have an account? <StyledLink to="/login">Sign in</StyledLink>
      </SignInLink>
    </SignUpContainer>
  );
};

export default SignUpForm;

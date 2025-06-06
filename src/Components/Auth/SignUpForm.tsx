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
import ReusableInput from "../../Commons/ReusableInputField";
import { ToastContainer, toast } from "react-toastify";
import handleGoogleSignIn from "./Helper/handleGoogleSignIn";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  SuccessResponse,
  ErrorResponse,
  UserRegistrationData,
} from "../../Types/ApiResponse";

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

import {
  SignUpContainer,
  Title,
  Description,
  Form,
  InputGroup,
  Label,
  Input,
  SignInLink,
  GoogleButton,
  Divider,
} from "./Styles/StyledAuth";
import { useState, ChangeEvent } from "react";
import Button from "../../Commons/Button";
import GoogleIcon from "../../Assets/GoogleIcon";
import IsDarkMode from "@/Types/IsDarkMode";

const SignUpForm = ({
  isDarkMode,
}: IsDarkMode) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //TODO: Implement sign up logic
  };

  const handleGoogleSignIn = () => {
    //TODO: Implement Google sign in logic
  };

  return (
    <SignUpContainer isDarkMode={isDarkMode}>
      <Title isDarkMode={isDarkMode}>Create an account</Title>
      <Description isDarkMode={isDarkMode}>
        Enter your email below to create your account
      </Description>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label isDarkMode={isDarkMode} htmlFor="email">
            Email
          </Label>
          <Input
            isDarkMode={isDarkMode}
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            required
          />
        </InputGroup>
        <InputGroup>
          <Label isDarkMode={isDarkMode} htmlFor="password">
            Password
          </Label>
          <Input
            isDarkMode={isDarkMode}
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            required
          />
        </InputGroup>
        <Button
          isDarkMode={isDarkMode}
          type="submit"
          color="primary"
          size="lg"
          handleClick={() => {}}
        >
          Sign Up with Email
        </Button>
      </Form>
      <Divider isDarkMode={isDarkMode}>or continue with</Divider>
      <GoogleButton
        type="button"
        isDarkMode={isDarkMode}
        onClick={handleGoogleSignIn}
      >
        <GoogleIcon />
        Sign in with Google
      </GoogleButton>
      <SignInLink isDarkMode={isDarkMode}>
        Already have an account? <span>Sign in</span>
      </SignInLink>
    </SignUpContainer>
  );
};

export default SignUpForm;

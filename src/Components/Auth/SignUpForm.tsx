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

const SignUpForm = () => {
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
    <SignUpContainer>
      <Title>Create an account</Title>
      <Description>
        Enter your email below to create your account
      </Description>
      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="email">
            Email
          </Label>
          <Input
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
          <Label htmlFor="password">
            Password
          </Label>
          <Input
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
          type="submit"
          color="primary"
          size="lg"
          handleClick={() => {}}
        >
          Sign Up with Email
        </Button>
      </Form>
      <Divider>or continue with</Divider>
      <GoogleButton
        type="button"
        onClick={handleGoogleSignIn}
      >
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

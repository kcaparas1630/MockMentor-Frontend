import {
  SignUpContainer,
  Title,
  Description,
  Form,
  SignInLink,
  GoogleButton,
  Divider,
} from "./Styles/StyledAuth";
import ReusableButton from "../../Commons/Button";
import GoogleIcon from "../../Assets/GoogleIcon";
import { SubmitHandler, useForm, FormProvider } from 'react-hook-form';
import SignUpProps from "@/Types/Login/SignUpProps";
import SignUpSchema from "./Schema/SignupSchema";
import { yupResolver } from '@hookform/resolvers/yup';
import ReusableInput from "../../Commons/ReuasbleInputField";

const SignUpForm = () => {
  
  const formData: SignUpProps = { email: '', password: '' };
  const methods = useForm<SignUpProps>({
    resolver: yupResolver(SignUpSchema),
    defaultValues: formData,
  })
  const onSubmit: SubmitHandler<SignUpProps> = async (data) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    console.log(data); // TODO: Implement sign up mutation.
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
      <FormProvider {...methods}>
        <Form onSubmit={methods.handleSubmit(onSubmit)}>
          <ReusableInput name="email" type="email" placeholder="Email" label="Email" />
          <ReusableInput name="password" type="password" placeholder="Password" label="Password" />
          <ReusableButton
            type="submit"
            color="primary"
            size="lg"
        >
          Sign Up with Email
        </ReusableButton>
        </Form>
      </FormProvider>
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

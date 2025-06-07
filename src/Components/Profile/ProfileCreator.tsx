import {
  ButtonGroup,
  FormContainer,
  FormHeader,
  FormHeaderGroup,
  FormSubHeader,
  InputGroup,
  ProfileContainer,
  ProgressDot,
  ProgressIndicator,
  ProgressContainer,
  FormGroup,
} from "./Styles/StyledProfile";
import ReusableInput from "../../Commons/ReusableInputField";
import { useState } from "react";
import { UpdateUser } from "../../Hooks/UserHooks";
import ReusableButton from "../../Commons/Button";
import { Dispatch, SetStateAction } from "react";
import { AxiosError } from "axios";
import { ErrorResponse } from "@/Types/ApiResponse";
import ProfileData from "@/Types/ProfileData";
import { ErrorMessage } from "../Auth/Styles/StyledAuth";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
interface ViewProps {
  steps: number;
  setSteps: Dispatch<SetStateAction<number>>;
  profileData: ProfileData;
  setProfileData: Dispatch<SetStateAction<ProfileData>>;
  authError: string | null;
  setAuthError: Dispatch<SetStateAction<string | null>>;
}

const NameInput = ({
  steps,
  setSteps,
  profileData,
  setProfileData,
  authError,
  setAuthError,
}: ViewProps) => {
  const handleNext = () => {
    if (!profileData.profile.name.trim()) {
      setAuthError("Name is required");
      return;
    }
    setAuthError(null);
    setSteps(steps + 1);
  };
  const handleBack = () => {
    if (steps > 1) {
      setSteps(steps - 1);
    }
  };

  return (
    <FormGroup>
      <FormHeaderGroup>
        <FormHeader>Hey I don't know your name yet.</FormHeader>
        <FormSubHeader>Let's get to know each other.</FormSubHeader>
      </FormHeaderGroup>
      <InputGroup>
        <ReusableInput
          name="name"
          type="text"
          placeholder="Your name: eg. John Doe"
          label="Name"
          value={profileData.profile.name}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              profile: { ...profileData.profile, name: e.target.value },
            })
          }
        />
        {authError && <ErrorMessage>{authError}</ErrorMessage>}
      </InputGroup>

      <ButtonGroup>
        <ReusableButton
          type="button"
          color="secondary"
          size="lg"
          onClick={handleBack}
          disabled={steps === 1}
        >
          <ArrowLeft size={24} aria-hidden="true" />
          <span>Back</span>
        </ReusableButton>
        <ReusableButton
          type="submit"
          color="primary"
          size="lg"
          onClick={handleNext}
          disabled={false}
        >
          <span>Next</span>
          <ArrowRight size={24} aria-hidden="true" />
        </ReusableButton>
      </ButtonGroup>
    </FormGroup>
  );
};
const JobRoleInput = ({
  profileData,
  setProfileData,
  setSteps,
  steps,
  authError,
  setAuthError,
}: ViewProps) => {
  const navigate = useNavigate();
  const handleUpdateUser = async () => {
    if (!profileData.profile.jobRole.trim()) {
      setAuthError("Job Role is required");
      return;
    }

    setAuthError(null);
    try {
      await UpdateUser(profileData);
      navigate({ to: "/video-test" });
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorMessage = (error.response.data as ErrorResponse).message;
        setAuthError(errorMessage);
      } else {
        setAuthError("An error occurred while updating your profile");
      }
    }
  };

  const handleBack = () => {
    setAuthError(null);
    setSteps(steps - 1);
  };

  return (
    <FormGroup>
      <FormHeaderGroup>
        <FormHeader>What are you looking for?</FormHeader>
        <FormSubHeader>Optional - Tell us about your ideal role.</FormSubHeader>
      </FormHeaderGroup>
      <InputGroup>
        <ReusableInput
          name="jobRole"
          type="text"
          placeholder="eg., Software Engineer, Product Manager, etc."
          label="Job Role"
          value={profileData.profile.jobRole}
          onChange={(e) =>
            setProfileData({
              ...profileData,
              profile: { ...profileData.profile, jobRole: e.target.value },
            })
          }
        />
        {authError && <ErrorMessage>{authError}</ErrorMessage>}
      </InputGroup>
      <ButtonGroup>
        <ReusableButton
          type="button"
          color="secondary"
          size="lg"
          onClick={handleBack}
        >
          <ArrowLeft size={24} aria-hidden="true" />
          <span>Back</span>
        </ReusableButton>
        <ReusableButton
          type="submit"
          color="primary"
          size="lg"
          onClick={handleUpdateUser}
          disabled={false}
        >
          <span>Complete</span>
          <ArrowRight size={24} aria-hidden="true" />
        </ReusableButton>
      </ButtonGroup>
    </FormGroup>
  );
};

// TODO: Add Analytics for the profile creator. (Where did the user discover the app?, etc.)

const ProgressIndicatorGroup = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => (
  <ProgressContainer>
    <ProgressIndicator>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <ProgressDot key={index} isActive={index < currentStep} />
      ))}
    </ProgressIndicator>
  </ProgressContainer>
);

const ProfileCreator = () => {
  const [steps, setSteps] = useState<number>(1);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    profile: {
      name: "",
      jobRole: "",
    },
  });

  return (
    <ProfileContainer>
      <FormContainer>
        <ProgressIndicatorGroup currentStep={steps} totalSteps={2} />
        {steps === 1 && (
          <NameInput
            steps={steps}
            setSteps={setSteps}
            profileData={profileData}
            setProfileData={setProfileData}
            authError={authError}
            setAuthError={setAuthError}
          />
        )}
        {steps === 2 && (
          <JobRoleInput
            steps={steps}
            setSteps={setSteps}
            profileData={profileData}
            setProfileData={setProfileData}
            authError={authError}
            setAuthError={setAuthError}
          />
        )}
      </FormContainer>
    </ProfileContainer>
  );
};

export default ProfileCreator;

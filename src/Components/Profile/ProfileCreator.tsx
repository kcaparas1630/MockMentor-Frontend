import { InputGroup, ProfileContainer } from "./Styles/StyledProfile";
import ReusableInput from "../../Commons/ReusableInputField";
import { useState } from "react";
import { GetUserQuery, UpdateUser } from "../../Hooks/UserHooks";
import ReusableButton from "../../Commons/Button";
import { Dispatch, SetStateAction } from "react";
import LoadingSpinner from "../../Commons/Spinner";
import ProfileData from "@/Types/ProfileData";
import { ErrorResponse } from "@/Types/ApiResponse";
import { AxiosError } from "axios";
import { ErrorMessage } from "../Auth/Styles/StyledAuth";
interface ViewProps {
  setView: Dispatch<SetStateAction<string>>;
  profileData: ProfileData;
  setProfileData: Dispatch<SetStateAction<ProfileData>>;
  authError: string | null;
  setAuthError: Dispatch<SetStateAction<string | null>>;
}

const NameInput = ({ setView, profileData, setProfileData, authError, setAuthError }: ViewProps) => {
  const handleNext = () => {
    if (!profileData.profile.name.trim()) {
      setAuthError("Name is required");
      return;
    }
    setAuthError(null);
    setView("jobRole");
  };

  return (
    <InputGroup>
      <ReusableInput
        name="name"
        type="text"
        placeholder="Name"
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
      <ReusableButton
        type="submit"
        color="primary"
        size="lg"
        onClick={handleNext}
        disabled={false}
      >
        Next
      </ReusableButton>
    </InputGroup>
  );
};
const JobRoleInput = ({ profileData, setProfileData, setView, authError, setAuthError }: ViewProps) => {
  const handleUpdateUser = async () => {
    if (!profileData.profile.jobRole.trim()) {
      setAuthError("Job Role is required");
      return;
    }
    
    setAuthError(null);
    try {
      await UpdateUser(profileData);
      //TODO: move to next view
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
    setView("name");
  };

  return (
    <InputGroup>
      <ReusableInput
        name="jobRole"
        type="text"
        placeholder="Job Role"
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
      <ReusableButton
        type="button"
        color="secondary"
        size="lg"
        onClick={handleBack}
      >
        Back
      </ReusableButton>
      <ReusableButton
        type="submit"
        color="primary"
        size="lg"
        onClick={handleUpdateUser}
        disabled={false}
      >
        Next
      </ReusableButton>
    </InputGroup>
  );
};

// TODO: Add Analytics for the profile creator. (Where did the user discover the app?, etc.)

const ProfileCreator = () => {
  const { users, isPending, isError } = GetUserQuery();
  const [view, setView] = useState<string>("name");
  const [authError, setAuthError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    profile: {
      name: "",
      jobRole: "",
    },
  });

  if (isPending) {
    return <LoadingSpinner />;
  }
  if (isError) {
    return <div>Error</div>;
  }

  return (
    <ProfileContainer>
      {users?.profile?.name === "" && view === "name" && (
        <NameInput
          setView={setView}
          profileData={profileData}
          setProfileData={setProfileData}
          authError={authError}
          setAuthError={setAuthError}
        />
      )}
      {view === "jobRole" && (
        <JobRoleInput
          profileData={profileData}
          setProfileData={setProfileData}
          setView={setView}
          authError={authError}
          setAuthError={setAuthError}
        />
      )}
    </ProfileContainer>
  );
};

export default ProfileCreator;

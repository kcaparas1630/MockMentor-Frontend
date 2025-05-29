import { InputGroup, ProfileContainer } from "./Styles/StyledProfile"
import ReusableInput from "../../Commons/ReuasbleInputField"
import { useState } from "react";
import { GetUserQuery, UpdateUser }
 from "../../Hooks/UserHooks";
import ReusableButton from "../../Commons/Button";
import { Dispatch, SetStateAction } from "react";
import LoadingSpinner from "../../Commons/Spinner";
import ProfileData from "@/Types/ProfileData";
interface ViewProps {
    setView?: Dispatch<SetStateAction<string>>;
    profileData: ProfileData;
    setProfileData: Dispatch<SetStateAction<ProfileData>>;
}

const NameInput = ({ setView, profileData, setProfileData }: ViewProps) => {
    return (
        <InputGroup>
            <ReusableInput name="name" type="text" placeholder="Name" label="Name" value={profileData.profile.name} onChange={(e) => setProfileData({ ...profileData, profile: { ...profileData.profile, name: e.target.value } })} />
            <ReusableButton type="submit" color="primary" size="lg" handleClick={() => setView && setView("jobRole")} disabled={false}>Next</ReusableButton>
        </InputGroup>
    )
}
const JobRoleInput = ({ profileData, setProfileData }: ViewProps) => {
    return (
        <InputGroup>
            <ReusableInput name="jobRole" type="text" placeholder="Job Role" label="Job Role" value={profileData.profile.jobRole} onChange={(e) => setProfileData({ ...profileData, profile: { ...profileData.profile, jobRole: e.target.value } })} />
            <ReusableButton type="submit" color="primary" size="lg" handleClick={() => UpdateUser(profileData)} disabled={false}>Next</ReusableButton>
        </InputGroup>
    )
}

// TODO: Add Analytics for the profile creator. (Where did the user discover the app?, etc.)

const ProfileCreator = () => {
    const { users, isPending, isError } = GetUserQuery();
    const [view, setView] = useState<string>("name");
    const [profileData, setProfileData] = useState<ProfileData>({
        profile: {
            name: "",
            jobRole: "",
        }
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
                />
            )}
           { view === "jobRole" && <JobRoleInput profileData={profileData} setProfileData={setProfileData} />}
        </ProfileContainer>
    )
}

export default ProfileCreator;

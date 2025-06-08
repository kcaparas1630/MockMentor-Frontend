import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { auth } from "../Firebase/FirebaseAuth";
import axios from "axios";
import ProfileData from "@/Types/ProfileData";


const getUserToken = async (): Promise<string> => {
    const user = auth.currentUser;
    if (user) {
        return user.getIdToken();
    }
    return "";
}
const getUser = async (): Promise<ProfileData> => {
    try {
        const userToken = await getUserToken();
        const response = await axios.get('http://localhost:3000/api/user', {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const UpdateUser = async (userData: ProfileData) => {
    console.log("User Data:", userData);
    try {
        const userToken = await getUserToken();
        const response = await axios.put('http://localhost:3000/api/update-user',
            userData,
            {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        })
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const GetUserQuery = () => {
    const {
        data: users,
        isPending,
        isError,
        refetch,
        status,
    }: UseQueryResult<ProfileData, Error> = useQuery({
        queryKey: ['user'],
        queryFn: getUser,
        enabled: !!auth.currentUser,
    })
    return {
        users,
        isPending,
        isError,
        refetch,
        status,
    }
}

export { GetUserQuery, UpdateUser, getUserToken };

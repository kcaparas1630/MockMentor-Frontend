/**
 * @fileoverview Custom hooks and utilities for user data management and API interactions.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a collection of user-related hooks and utility functions for managing
 * user data, authentication tokens, and API interactions. It provides React Query integration
 * for server state management and handles user profile data operations. It plays a crucial
 * role in user session management and profile data persistence.
 *
 * @see {@link src/Firebase/FirebaseAuth.ts}
 * @see {@link src/Types/ProfileData.ts}
 *
 * Dependencies:
 * - React Query
 * - Firebase Auth
 * - Axios
 * - ProfileData type
 */

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { auth } from "../Firebase/FirebaseAuth";
import axios from "axios";
import ProfileData from "@/Types/ProfileData";

const baseUrl = import.meta.env.VITE_EXPRESS_URL || 'http://localhost:3000';

/**
 * Retrieves the current user's Firebase ID token for API authentication.
 *
 * @function
 * @returns {Promise<string>} Firebase ID token or empty string if no user.
 * Example Return Value: `"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."`
 * @example
 * // Example usage:
 * const token = await getUserToken();
 * console.log(token);
 *
 * @throws {Error} Throws if token retrieval fails.
 * @remarks
 * Side Effects: Requests Firebase ID token.
 *
 * Known Issues/Limitations:
 * - Returns empty string instead of throwing when no user
 * - No token refresh handling
 *
 * Design Decisions/Rationale:
 * - Uses Firebase currentUser for token access
 * - Returns empty string for graceful handling
 * - Centralizes token retrieval logic
 */
const getUserToken = async (): Promise<string> => {
    const user = auth.currentUser;
    if (user) {
        return user.getIdToken();
    }
    return "";
}

/**
 * Fetches user profile data from the backend API.
 *
 * @function
 * @returns {Promise<ProfileData>} User profile data from API.
 * Example Return Value: `{ id: "123", email: "user@example.com", profile: {...} }`
 * @example
 * // Example usage:
 * const userData = await getUser();
 * console.log(userData.profile.name);
 *
 * @throws {Error} Throws if API request fails or user is not authenticated.
 * @remarks
 * Side Effects: Makes HTTP GET request to backend API.
 *
 * Known Issues/Limitations:
 * - Hardcoded API endpoint URL
 * - No retry logic for failed requests
 * - Assumes user is authenticated
 *
 * Design Decisions/Rationale:
 * - Uses axios for HTTP requests
 * - Includes authorization header with token
 * - Returns typed ProfileData
 * - Centralizes user data fetching
 */
const getUser = async (): Promise<ProfileData> => {
    try {
        const userToken = await getUserToken();
        const response = await axios.get(`${baseUrl}/api/user`, {
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

/**
 * Updates user profile data via backend API.
 *
 * @function
 * @param {ProfileData} userData - User profile data to update.
 * @returns {Promise<ProfileData>} Updated user profile data from API.
 * Example Return Value: `{ id: "123", email: "user@example.com", profile: {...} }`
 * @example
 * // Example usage:
 * const updatedUser = await UpdateUser({ ...userData, profile: { name: "John" } });
 * console.log(updatedUser);
 *
 * @throws {Error} Throws if API request fails or user is not authenticated.
 * @remarks
 * Side Effects: Makes HTTP PUT request to backend API.
 *
 * Known Issues/Limitations:
 * - Hardcoded API endpoint URL
 * - No validation of userData
 * - No optimistic updates
 *
 * Design Decisions/Rationale:
 * - Uses axios for HTTP requests
 * - Includes authorization header with token
 * - Returns updated data for state management
 * - Centralizes user update logic
 */
const UpdateUser = async (userData: ProfileData) => {
    try {
        const userToken = await getUserToken();
        const response = await axios.put(`${baseUrl}/api/update-user`,
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

/**
 * React Query hook for fetching and managing user data.
 *
 * @function
 * @returns {object} Query result with user data and state management functions.
 * @example
 * // Usage in components:
 * const { users, isPending, isError, refetch } = GetUserQuery();
 * 
 * if (isPending) return <LoadingSpinner />;
 * if (isError) return <ErrorMessage />;
 * 
 * console.log(users.profile.name);
 *
 * @throws {Error} Throws if query fails or user is not authenticated.
 * @remarks
 * Side Effects: 
 * - Makes API request when enabled
 * - Manages query cache
 * - Triggers re-renders on state changes
 *
 * Known Issues/Limitations:
 * - Only enabled when user is authenticated
 * - No automatic retry configuration
 * - No background refetching
 *
 * Design Decisions/Rationale:
 * - Uses React Query for server state management
 * - Conditionally enabled based on auth state
 * - Returns comprehensive query state
 * - Uses 'user' as query key for caching
 */
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

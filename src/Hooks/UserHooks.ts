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
import tokenStorage from "@/Utils/TokenStorage";


const baseUrl = import.meta.env.VITE_EXPRESS_URL || 'http://localhost:3000';

/**
 * Retrieves the current user's Firebase ID token with secure caching.
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
 * Side Effects: 
 * - Requests Firebase ID token
 * - Stores token securely in encrypted storage
 *
 * Known Issues/Limitations:
 * - Returns empty string instead of throwing when no user
 * - Token refresh handled automatically by Firebase
 *
 * Design Decisions/Rationale:
 * - Uses secure token storage for performance and security
 * - Falls back to Firebase for fresh tokens
 * - Centralizes token retrieval logic
 */
const getUserToken = async (): Promise<string> => {
    try {
        // Check if we have a valid cached token first
        const cachedToken = await tokenStorage.getToken();
        if (cachedToken) {
            return cachedToken;
        }

        // Get fresh token from Firebase
        const user = auth.currentUser;
        if (user) {
            const freshToken = await user.getIdToken();
            
            // Store the fresh token securely
            await tokenStorage.storeToken(freshToken, 3600); // 1 hour expiry
            
            return freshToken;
        }
        
        return "";
    } catch (error) {
        console.error('Error retrieving user token:', error);
        return "";
    }
}

/**
 * Gets authorization headers with secure token for API requests.
 *
 * @function
 * @returns {Promise<Record<string, string>>} Headers object with Authorization and Content-Type.
 * Example Return Value: `{ "Authorization": "Bearer token...", "Content-Type": "application/json" }`
 * @example
 * // Example usage:
 * const headers = await getAuthHeaders();
 * const response = await axios.get('/api/data', { headers });
 *
 * @throws {Error} Throws if no valid token is available.
 * @remarks
 * Side Effects: May refresh and store token if needed.
 *
 * Design Decisions/Rationale:
 * - Centralizes header creation logic
 * - Ensures consistent header format
 * - Handles token retrieval automatically
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
        return await tokenStorage.getAuthHeaders();
    } catch (error) {
        console.warn('Failed to get auth headers from token storage:', error);
        // Fallback to getUserToken if tokenStorage fails
        const token = await getUserToken();
        if (!token) {
            throw new Error('No valid authentication token available', );
        }
        
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }
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
        const headers = await getAuthHeaders();
        const response = await axios.get(`${baseUrl}/api/user`, { headers });
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
        const headers = await getAuthHeaders();
        const response = await axios.put(`${baseUrl}/api/update-user`, userData, { headers });
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

export { GetUserQuery, UpdateUser, getUserToken, getAuthHeaders };

/**
 * @fileoverview Authentication guard component that protects routes by checking Firebase authentication state.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a route protection mechanism that ensures only authenticated users can access
 * protected routes. It monitors Firebase authentication state, shows loading spinner during auth checks,
 * and redirects unauthenticated users to the login page. It plays a crucial role in application security
 * and user session management.
 *
 * @see {@link src/Firebase/FirebaseAuth.ts}
 * @see {@link src/Commons/Spinner.tsx}
 *
 * Dependencies:
 * - React
 * - Firebase Auth
 * - TanStack Router
 */

import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { auth } from '@/Firebase/FirebaseAuth';
import LoadingSpinner from '@/Commons/Spinner';

/**
 * Props interface for the AuthGuard component.
 * @interface AuthGuardProps
 * @property {React.ReactNode} children - The child components to render when authenticated.
 */
interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * Authentication guard component that protects routes and manages authentication state.
 *
 * @component
 * @param {AuthGuardProps} props - Component props containing children to render.
 * @param {React.ReactNode} props.children - Child components to render when user is authenticated.
 * @returns {JSX.Element} Either the protected content, loading spinner, or null.
 * @example
 * // Usage in routing or parent components:
 * <AuthGuard>
 *   <ProtectedComponent />
 * </AuthGuard>
 *
 * @throws {Error} Logs authentication errors to console and redirects to login.
 * @remarks
 * Side Effects: 
 * - Monitors Firebase authentication state
 * - Redirects unauthenticated users to login
 * - Logs authentication errors to console
 *
 * Known Issues/Limitations:
 * - No retry mechanism for failed auth checks
 * - Assumes login route exists at '/login'
 * - No offline authentication support
 *
 * Design Decisions/Rationale:
 * - Uses Firebase onAuthStateChanged for real-time auth monitoring
 * - Shows loading spinner during auth state checks
 * - Redirects with replace to prevent back navigation to protected routes
 * - Implements proper cleanup of auth listener
 */
const AuthGuard = ({ children }: AuthGuardProps) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setAuthenticated(true);
            } else {
                navigate({ to: '/login', replace: true });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error checking auth state:", error);
            setAuthenticated(false);
            navigate({ to: '/login', replace: true });
            setLoading(false);
        });

        return unsubscribe;
    }, [navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return authenticated ? <>{children}</> : null;
};

export default AuthGuard;

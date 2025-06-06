
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { auth } from '../Firebase/FirebaseAuth';
import LoadingSpinner from '../Commons/Spinner';

interface AuthGuardProps {
    children: React.ReactNode;
}

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

type FirebaseAuthErrorCodes = 
    | 'auth/email-already-in-use'
    | 'auth/invalid-email'
    | 'auth/weak-password'
    | 'auth/user-not-found'
    | 'auth/too-many-requests'

interface FirebaseAuthError extends Error {
    code: FirebaseAuthErrorCodes;
    message: string;
}
// type guard to check if the error is a FirebaseAuthError
const isFirebaseAuthError = (error: unknown): error is FirebaseAuthError => {
    return (
        error instanceof Error &&
        'code' in error &&
        typeof (error as { code: string }).code === 'string' &&
        (error as { code: string }).code.startsWith('auth/')
    );
};

export default isFirebaseAuthError;

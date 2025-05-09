type FirebaseAuthErrorCodes = 
    | 'auth/email-already-in-use'
    | 'auth/invalid-email'
    | 'auth/password-does-not-meet-requirements'
    | 'auth/user-not-found'
    | 'auth/too-many-requests'
    | 'auth/popup-closed-by-user'

interface FirebaseAuthError extends Error {
    code: FirebaseAuthErrorCodes;
    message: string;
}
// type guard to check if the error is a FirebaseAuthError
// can't use error: FirebaseAuthError directly because typescript doesn't check for type in compilation.
const isFirebaseAuthError = (error: unknown): error is FirebaseAuthError => {
    return (
        error instanceof Error &&
        'code' in error &&
        typeof (error as { code: string }).code === 'string' &&
        (error as { code: string }).code.startsWith('auth/')
    );
};

export default isFirebaseAuthError;

export interface ErrorResponse {
    statusCode: number;
    message: string;
    errorCode: string;
}

export interface SuccessResponse {
    id: string;
    email: string;
}

export interface UserRegistrationData {
    email: string;
    password: string;
}

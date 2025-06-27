import { createRoute } from "@tanstack/react-router";
import rootRoute from "../__root";
import AuthGuard from "../../Components/AuthGuard";
import InterviewRoom from "../../Components/Interview/InterviewRoom/InterviewRoom";

interface SearchParams {
    jobLevel: string;
    interviewType: string;
}

const ProtectedInterviewRoom = () => {
    return (
        <AuthGuard>
            <InterviewRoom />
        </AuthGuard>
    )   
}

export const Route = createRoute({
    path: "/interview-room/$sessionId",
    component: ProtectedInterviewRoom,
    getParentRoute: () => rootRoute,
    validateSearch: (search: Record<string, unknown>): SearchParams => {
        if (!search.jobLevel || typeof search.jobLevel !== 'string') {
            throw new Error('Missing required parameter: jobLevel');
        }
        if (!search.interviewType || typeof search.interviewType !== 'string') {
            throw new Error('Missing required parameter: interviewType');
        }
        return {
            jobLevel: search.jobLevel,
            interviewType: search.interviewType,
        };
    },
    loader: ({ params }) => {
        return { 
            sessionId: params.sessionId
         };
    },
});

export default Route;

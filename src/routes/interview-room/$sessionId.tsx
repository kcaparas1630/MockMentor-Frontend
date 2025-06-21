import { createRoute } from "@tanstack/react-router";
import rootRoute from "../__root";
import AuthGuard from "../../Components/AuthGuard";
import InterviewRoom from "../../Components/Interview/InterviewRoom";

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
    validateSearch: (search: Record<string, unknown>): SearchParams => ({
        jobLevel: search.jobLevel as string,
        interviewType: search.interviewType as string,
    }),
    loader: ({ params }) => {
        return { 
            sessionId: params.sessionId
         };
    },
});

export default Route;

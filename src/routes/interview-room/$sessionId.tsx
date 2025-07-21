import { createRoute } from "@tanstack/react-router";
import rootRoute from "../__root";
import AuthGuard from "../../Components/AuthGuard";
import InterviewRoom from "../../Components/Interview/InterviewRoom/InterviewRoom";

interface SearchParams {
    jobLevel: string;
    interviewType: string;
    currentQuestion?: string;
}
// Helper function to safely extract question text
const extractQuestionText = (questionData: unknown): string | undefined => {
    if (!questionData) return undefined;
    
    // If it's already a string
    if (typeof questionData === 'string') {
        return questionData;
    }
    
    // If it's an object with a question property
    if (typeof questionData === 'object' && questionData !== null) {
        const questionObj = questionData as Record<string, unknown>;
        if (typeof questionObj.question === 'string') {
            return questionObj.question;
        }
    }
    
    return undefined;
};

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

        // extract the question text safely
        const currentQuestion = extractQuestionText(search.currentQuestion);
        return {
            jobLevel: search.jobLevel,
            interviewType: search.interviewType,
            currentQuestion
        };
    },
    loader: ({ params }) => {
        return { 
            sessionId: params.sessionId,
         };
    },
});

export default Route;

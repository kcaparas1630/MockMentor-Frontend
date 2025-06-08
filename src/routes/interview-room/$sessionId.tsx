import { createRoute } from "@tanstack/react-router";
import rootRoute from "../__root";
import AuthGuard from "../../Components/AuthGuard";
import InterviewRoom from "../../Components/Interview/InterviewRoom";

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
    loader: ({ params }) => {
        return { sessionId: params.sessionId };
    },
});

export default Route;

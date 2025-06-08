import { createRoute } from "@tanstack/react-router";
import rootRoute from "./__root";
import AuthGuard from "../Components/AuthGuard";

const InterviewRoom = () => {
    return (
        <AuthGuard>
            <div>Interview Room</div> //TODO: Add interview room component
        </AuthGuard>
    )
}

export const Route = createRoute({
    path: "/interview-room-$sessionId",
    component: InterviewRoom,
    getParentRoute: () => rootRoute,
});

export default Route;

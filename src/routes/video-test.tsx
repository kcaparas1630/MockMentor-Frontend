import { createRoute } from "@tanstack/react-router";
import rootRoute from "./__root";
import InterviewIndex from "../Components/Interview/InterviewIndex";
import AuthGuard from "../Components/AuthGuard";

const ProtectedVideoTest = () => {
    return (
        <AuthGuard>
            <InterviewIndex />
        </AuthGuard>
    )
}
// Create a protected video-test route
export const Route = createRoute({
    path: '/video-test',
    component: ProtectedVideoTest,
    getParentRoute: () => rootRoute,
});

export default Route;

import { createRoute } from "@tanstack/react-router";
import rootRoute from "./__root";
import VideoTestCard from "../Components/Interview/VideoTestCard";
import AuthGuard from "../Components/AuthGuard";

const ProtectedVideoTest = () => {
    return (
        <AuthGuard>
            <VideoTestCard />
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

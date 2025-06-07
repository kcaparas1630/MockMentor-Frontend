import { createRoute } from "@tanstack/react-router";
import rootRoute from "./__root";
import ProfileCreator from "../Components/Profile/ProfileCreator";
import AuthGuard from "../Components/AuthGuard";

const ProtectedProfileCreate = () => {
    return (
        <AuthGuard>
            <ProfileCreator />
        </AuthGuard>
    )
}
// Create a protected profile-create route
export const Route = createRoute({
    path: '/profile-create',
    component: ProtectedProfileCreate,
    getParentRoute: () => rootRoute,
});

export default Route;

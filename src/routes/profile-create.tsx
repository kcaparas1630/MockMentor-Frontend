import { createRoute } from "@tanstack/react-router";
import rootRoute from "./__root";
import ProfileCreator from "../Components/Profile/ProfileCreator";

// Create a signup route
export const Route = createRoute({
    path: '/profile-create',
    component: ProfileCreator,
    getParentRoute: () => rootRoute,
});

export default Route;

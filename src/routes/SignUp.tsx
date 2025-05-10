import { createRoute } from "@tanstack/react-router";
import rootRoute from "./__root";
import SignUpForm from "../Components/Auth/SignUpForm";

// Create a signup route
export const Route = createRoute({
    path: '/signup',
    component: SignUpForm,
    getParentRoute: () => rootRoute,
});

export default Route;

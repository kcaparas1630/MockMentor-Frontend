import { createRoute } from "@tanstack/react-router";
import rootRoute from "./__root";
import LoginForm from "../Components/Auth/LoginForm";

// Create a login route
export const Route = createRoute({
    path: '/login',
    component: LoginForm,
    getParentRoute: () => rootRoute,
});

export default Route;

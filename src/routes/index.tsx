import { createRoute, redirect } from "@tanstack/react-router";
import rootRoute from "./__root";

// Create an index route that redirects to /login
export const Route = createRoute({
    path: '/',
    getParentRoute: () => rootRoute,
    beforeLoad: () => {
        throw redirect({
            to: '/login',
            replace: true
        });
    }
});

export default Route;

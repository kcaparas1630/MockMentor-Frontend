import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Container } from "../StyledApp";

export const Route = createRootRoute({
    component: () => (
        <Container>
            <Outlet />
        </Container>
    ),
});

export default Route;

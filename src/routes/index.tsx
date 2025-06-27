/**
 * @fileoverview Index route that handles root path redirection to login page.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as the index route configuration that automatically redirects users
 * from the root path to the login page. It uses TanStack Router's beforeLoad hook
 * to perform the redirection before the route loads. It plays a crucial role in
 * the application's routing structure and user flow management.
 *
 * @see {@link src/routes/__root.tsx}
 * @see {@link src/routes/login.tsx}
 *
 * Dependencies:
 * - TanStack Router
 */

import { createRoute, redirect } from "@tanstack/react-router";
import rootRoute from "./__root";

/**
 * Index route that redirects root path to login page.
 *
 * @constant {Route} Route - TanStack Router route configuration.
 * @example
 * // This route automatically redirects '/' to '/login'
 * // No direct usage needed - handled by router
 *
 * @throws {Redirect} Throws redirect to '/login' when accessed.
 * @remarks
 * Side Effects: 
 * - Performs client-side redirect
 * - Replaces current history entry
 *
 * Known Issues/Limitations:
 * - No authentication check before redirect
 * - Hardcoded redirect destination
 * - No fallback for failed redirects
 *
 * Design Decisions/Rationale:
 * - Uses beforeLoad for immediate redirection
 * - Replaces history to prevent back navigation
 * - Redirects to login as default landing page
 * - Follows TanStack Router patterns
 */
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

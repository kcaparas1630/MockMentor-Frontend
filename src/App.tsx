/**
 * @fileoverview Main application component that serves as the root container for the AI Interview Frontend application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as the primary entry point for the React application. It provides the main container
 * and renders the SignUpForm component as the default view. It plays a crucial role in establishing
 * the application's root structure and initial routing setup.
 *
 * @see {@link src/Components/Auth/SignUpForm.tsx}
 * @see {@link src/StyledApp.ts}
 *
 * Dependencies:
 * - React
 * - SignUpForm component
 * - StyledApp container
 */

import SignUpForm from "./Components/Auth/SignUpForm";
import { Container } from "./StyledApp";

/**
 * Main application component that renders the root container with the SignUpForm.
 *
 * @component
 * @returns {JSX.Element} The rendered application with SignUpForm as the main content.
 * @example
 * // Usage in main.tsx:
 * <App />
 *
 * @remarks
 * Side Effects: None - this is a pure component that only renders UI elements.
 *
 * Known Issues/Limitations:
 * - Currently hardcoded to show SignUpForm instead of using proper routing
 * - No error boundaries implemented
 *
 * Design Decisions/Rationale:
 * - Uses a simple container structure for consistent styling
 * - SignUpForm is rendered directly as this appears to be a development/testing setup
 */
function App() {

  return (
    <Container>
      <SignUpForm />
    </Container>
  );
}

export default App;

/**
 * @fileoverview Loading spinner component that provides consistent loading state visualization.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a standardized loading spinner component that provides consistent
 * loading state visualization across the application. It wraps the styled spinner implementation
 * with a clean interface and ensures consistent loading UX. It plays a crucial role in
 * providing user feedback during asynchronous operations.
 *
 * @see {@link src/Commons/Styles/StyledSpinner.ts}
 *
 * Dependencies:
 * - React
 * - StyledSpinner component
 */

import Spinner from './Styles/StyledSpinner';

/**
 * Loading spinner component for displaying loading states.
 *
 * @component
 * @returns {JSX.Element} The rendered loading spinner.
 * @example
 * // Basic usage:
 * <LoadingSpinner />
 *
 * // Conditional rendering:
 * {isLoading && <LoadingSpinner />}
 *
 * @throws {Error} No errors thrown - this is a pure UI component.
 * @remarks
 * Side Effects: None - this is a pure component that only renders UI elements.
 *
 * Known Issues/Limitations:
 * - No customizable size options
 * - No color customization
 * - No accessibility features
 *
 * Design Decisions/Rationale:
 * - Simple wrapper around styled component
 * - Consistent loading experience across app
 * - Minimal props for simplicity
 * - Uses CSS animations for performance
 */
const LoadingSpinner = () => {
  return <Spinner />;
};

export default LoadingSpinner; 

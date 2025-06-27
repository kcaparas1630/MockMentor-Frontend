/**
 * @fileoverview Reusable button component that provides consistent styling and behavior across the application.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a standardized button component that wraps the styled button implementation
 * with consistent props interface. It provides type-safe button functionality with customizable
 * colors, sizes, and states. It plays a crucial role in maintaining UI consistency and
 * reducing code duplication across the application.
 *
 * @see {@link src/Commons/Styles/StyledButton.ts}
 * @see {@link src/Types/ButtonTypes.ts}
 *
 * Dependencies:
 * - React
 * - StyledButton component
 * - ButtonProps type definition
 */

import StyledButton from "./Styles/StyledButton";
import ButtonProps from "@/Types/ButtonTypes";

/**
 * Reusable button component with consistent styling and behavior.
 *
 * @component
 * @param {ButtonProps} props - Button configuration props.
 * @param {string} [props.color] - Button color variant.
 * Default Value: `"primary"`
 * @param {string} [props.size] - Button size variant.
 * Default Value: `"md"`
 * @param {string} [props.type] - HTML button type attribute.
 * Default Value: `"button"`
 * @param {Function} [props.onClick] - Click event handler function.
 * @param {React.ReactNode} props.children - Button content/label.
 * @param {boolean} [props.disabled] - Whether the button is disabled.
 * Default Value: `false`
 * @returns {JSX.Element} The rendered button with applied styling and behavior.
 * @example
 * // Basic usage:
 * <ReusableButton color="primary" size="lg" onClick={handleClick}>
 *   Click Me
 * </ReusableButton>
 *
 * // Submit button:
 * <ReusableButton type="submit" color="primary">
 *   Submit Form
 * </ReusableButton>
 *
 * @throws {Error} No errors thrown - this is a pure UI component.
 * @remarks
 * Side Effects: None - this is a pure component that only renders UI elements.
 *
 * Known Issues/Limitations:
 * - No loading state support
 * - No icon support built-in
 * - Limited accessibility features
 *
 * Design Decisions/Rationale:
 * - Uses composition pattern with styled component
 * - Provides type-safe props interface
 * - Maintains consistent API across application
 * - Separates styling concerns from component logic
 */
const ReusableButton = ({
  color,
  size,
  type,
  onClick,
  children,
  disabled,
}: ButtonProps) => (
  <StyledButton onClick={onClick} color={color} size={size} type={type} disabled={disabled}>
    {children}
  </StyledButton>
);

export default ReusableButton;

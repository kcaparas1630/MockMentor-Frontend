/**
 * @fileoverview Reusable input field component that provides consistent form input styling and behavior.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a standardized input field component that provides consistent styling,
 * labeling, and behavior for form inputs across the application. It wraps styled components
 * with a clean props interface and ensures accessibility through proper label associations.
 * It plays a crucial role in maintaining form consistency and reducing code duplication.
 *
 * @see {@link src/Commons/Styles/StyledInput.ts}
 * @see {@link src/Types/Forms/Input.ts}
 *
 * Dependencies:
 * - React
 * - Styled input components
 * - InputProps type definition
 */

import { FC } from "react";
import InputProps from "../Types/Forms/Input";
import { Label, InputField, InputContainer } from "./Styles/StyledInput";

/**
 * Reusable input field component with consistent styling and accessibility features.
 *
 * @component
 * @param {InputProps} props - Input field configuration props.
 * @param {string} props.name - Input field name and ID for form association.
 * @param {string} props.type - HTML input type attribute.
 * @param {string} [props.placeholder] - Placeholder text for the input field.
 * @param {string} props.label - Label text displayed above the input field.
 * @param {string} props.value - Current value of the input field.
 * @param {Function} props.onChange - Change event handler function.
 * @returns {JSX.Element} The rendered input field with label and styling.
 * @example
 * // Basic text input:
 * <ReusableInput
 *   name="email"
 *   type="email"
 *   placeholder="Enter your email"
 *   label="Email Address"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * // Password input:
 * <ReusableInput
 *   name="password"
 *   type="password"
 *   placeholder="Enter your password"
 *   label="Password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 *
 * @throws {Error} No errors thrown - this is a pure UI component.
 * @remarks
 * Side Effects: None - this is a pure component that only renders UI elements.
 *
 * Known Issues/Limitations:
 * - No validation display support
 * - No error state styling
 * - Limited input types supported
 *
 * Design Decisions/Rationale:
 * - Uses functional component with explicit FC type
 * - Associates label with input using htmlFor and id
 * - Separates styling concerns into styled components
 * - Provides clean, type-safe props interface
 */
const ReusableInput: FC<InputProps> = ({ name, type, placeholder, label, value, onChange }) => {

  return (
    <InputContainer>
      <Label htmlFor={name}>{label}</Label>
      <InputField type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </InputContainer>
  );
};

export default ReusableInput;

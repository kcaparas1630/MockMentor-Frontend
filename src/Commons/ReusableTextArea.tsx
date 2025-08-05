/**
 * @fileoverview Reusable text area component that provides consistent form textarea styling and behavior.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a standardized textarea component that provides consistent styling,
 * labeling, and behavior for form textareas across the application. It wraps styled components
 * with a clean props interface and ensures accessibility through proper label associations.
 * It includes a 3000 character limit with a character counter and is resizable by default.
 *
 * @see {@link src/Commons/Styles/StyledTextArea.ts}
 * @see {@link src/Types/Forms/TextArea.ts}
 *
 * Dependencies:
 * - React
 * - Styled textarea components
 * - TextAreaProps type definition
 */

import { FC } from "react";
import TextAreaProps from "../Types/Forms/TextArea";
import { Label, TextArea, TextAreaContainer, CharCounter } from "./Styles/StyledTextArea";

/**
 * Reusable textarea component with consistent styling, accessibility features, and character limit.
 *
 * @component
 * @param {TextAreaProps} props - TextArea configuration props.
 * @param {string} props.name - TextArea name and ID for form association.
 * @param {string} [props.placeholder] - Placeholder text for the textarea.
 * @param {string} props.label - Label text displayed above the textarea.
 * @param {string} props.value - Current value of the textarea.
 * @param {Function} props.onChange - Change event handler function.
 * @param {number} [props.maxLength=3000] - Maximum character limit (defaults to 3000).
 * @param {number} [props.rows=4] - Number of visible text lines.
 * @param {boolean} [props.resizable=true] - Whether the textarea is resizable.
 * @returns {JSX.Element} The rendered textarea with label, character counter, and styling.
 * @example
 * // Basic textarea:
 * <ReusableTextArea
 *   name="description"
 *   placeholder="Enter your description"
 *   label="Description"
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 * />
 *
 * // Non-resizable textarea with custom rows:
 * <ReusableTextArea
 *   name="comment"
 *   placeholder="Enter your comment"
 *   label="Comment"
 *   value={comment}
 *   onChange={(e) => setComment(e.target.value)}
 *   rows={6}
 *   resizable={false}
 * />
 *
 * @throws {Error} No errors thrown - this is a pure UI component.
 * @remarks
 * Side Effects: None - this is a pure component that only renders UI elements.
 *
 * Known Issues/Limitations:
 * - Character limit is enforced through maxLength attribute
 * - No validation display support
 * - No error state styling
 *
 * Design Decisions/Rationale:
 * - Uses functional component with explicit FC type
 * - Associates label with textarea using htmlFor and id
 * - Separates styling concerns into styled components
 * - Provides clean, type-safe props interface
 * - Includes character counter for user feedback
 * - Resizable by default for better user experience
 */
const ReusableTextArea: FC<TextAreaProps> = ({ 
  name, 
  placeholder, 
  label, 
  value, 
  onChange, 
  maxLength = 3000,
  rows = 4,
}) => {
  const characterCount = value.length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <TextAreaContainer>
      <Label htmlFor={name}>{label}</Label>
      <TextArea 
        id={name}
        name={name}
        placeholder={placeholder} 
        value={value} 
        onChange={handleChange}
        maxLength={maxLength}
        rows={rows}
      />
      <CharCounter count={characterCount} maxCount={maxLength}>
        {characterCount.toLocaleString()} / {maxLength.toLocaleString()} characters
      </CharCounter>
      
    </TextAreaContainer>
  );
};

export default ReusableTextArea;

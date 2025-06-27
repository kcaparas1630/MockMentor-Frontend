/**
 * @fileoverview Reusable select dropdown component with custom styling and keyboard navigation support.
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This file serves as a customizable select dropdown component that provides consistent styling,
 * click-outside behavior, and accessibility features. It manages dropdown state, handles user
 * interactions, and provides a clean interface for option selection. It plays a crucial role
 * in maintaining form consistency and providing better UX than native select elements.
 *
 * @see {@link src/Commons/Styles/StyledSelect.ts}
 * @see {@link src/Types/SelectTypes.ts}
 *
 * Dependencies:
 * - React
 * - Lucide React (ChevronDown icon)
 * - Styled select components
 * - SelectProps type definition
 */

import { FC, useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import SelectProps from "@/Types/SelectTypes";
import {
  SelectContainer,
  SelectLabel,
  SelectWrapper,
  SelectTrigger,
  SelectValue,
  SelectIcon,
  SelectContent,
  SelectItem,
} from "./Styles/StyledSelect";

/**
 * Reusable select dropdown component with custom styling and interaction handling.
 *
 * @component
 * @param {SelectProps} props - Select component configuration props.
 * @param {string} props.name - Select field name and ID for form association.
 * @param {string} props.label - Label text displayed above the select field.
 * @param {string} [props.value] - Currently selected option value.
 * @param {string} [props.placeholder] - Placeholder text when no option is selected.
 * @param {Array} props.options - Array of selectable options.
 * @param {Function} props.onChange - Change event handler function.
 * @param {boolean} [props.disabled] - Whether the select is disabled.
 * Default Value: `false`
 * @returns {JSX.Element} The rendered select dropdown with label and styling.
 * @example
 * // Basic select with options:
 * <ReusableSelect
 *   name="country"
 *   label="Select Country"
 *   placeholder="Choose a country"
 *   value={selectedCountry}
 *   options={[
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" }
 *   ]}
 *   onChange={setSelectedCountry}
 * />
 *
 * @throws {Error} No errors thrown - this is a pure UI component.
 * @remarks
 * Side Effects: 
 * - Adds/removes document click event listener
 * - Manages dropdown open/close state
 *
 * Known Issues/Limitations:
 * - No keyboard navigation support
 * - No search/filter functionality
 * - Limited accessibility features
 *
 * Design Decisions/Rationale:
 * - Uses click-outside pattern for better UX
 * - Manages dropdown state internally
 * - Provides visual feedback for selected state
 * - Uses refs for DOM manipulation
 */
const ReusableSelect: FC<SelectProps> = ({
  name,
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Toggles the dropdown open/close state.
   *
   * @function
   * @returns {void} Updates the dropdown state.
   * @example
   * // Called automatically on trigger click:
   * <SelectTrigger onClick={handleToggle}>
   *
   * @remarks
   * Side Effects: Updates isOpen state.
   */
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  /**
   * Handles option selection and closes the dropdown.
   *
   * @function
   * @param {string} optionValue - The value of the selected option.
   * @returns {void} Calls onChange and closes dropdown.
   * @example
   * // Called automatically on option click:
   * <SelectItem onClick={() => handleSelect(option.value)}>
   *
   * @remarks
   * Side Effects: 
   * - Calls onChange callback
   * - Closes dropdown
   */
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <SelectContainer>
      <SelectLabel htmlFor={name}>{label}</SelectLabel>
      <SelectWrapper ref={selectRef}>
        <SelectTrigger
          id={name}
          onClick={handleToggle}
          disabled={disabled}
          type="button"
        >
          <SelectValue hasValue={!!value}>
            {displayValue}
          </SelectValue>
          <SelectIcon isOpen={isOpen}>
            <ChevronDown size={16} />
          </SelectIcon>
        </SelectTrigger>
        <SelectContent isOpen={isOpen}>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              isSelected={option.value === value}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectWrapper>
    </SelectContainer>
  );
};

export default ReusableSelect; 

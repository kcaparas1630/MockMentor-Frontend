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

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

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

import styled from "@emotion/styled";
import ButtonProps from "@/Types/ButtonTypes";

const StyledButton = styled.button<ButtonProps>`
  width: ${({ size }) => size === "sm" ? "25%" : size === "md" ? "50%" : "100%"};
  padding: 0.625rem;
  border-radius: 0.375rem;
  border: none;
  background-color: ${({ color, isDarkMode }) => {
    switch (color) {
      case "primary":
        return isDarkMode ? "#EBEBEB" : "#252525";
      case "secondary":
        return isDarkMode ? "#444444" : "#F7F7F7";
    }
  }};
  color: ${({ color, isDarkMode}) => {
    switch (color) {
      case "primary":
        return isDarkMode ? "#252525" : "#FBFBFB";
      case "secondary":
        return isDarkMode ? "#FBFBFB" : "#252525";
        
    }
  }};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ isDarkMode }) => isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;



export default StyledButton;

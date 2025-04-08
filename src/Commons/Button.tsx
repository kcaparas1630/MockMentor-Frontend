import StyledButton from "./Styles/StyledButton";
import ButtonProps from "@/Types/ButtonTypes";

const Button = ({
  color,
  size,
  type,
  handleClick,
  children,
  isDarkMode,
}: ButtonProps) => (
  <StyledButton isDarkMode={isDarkMode} handleClick={handleClick} color={color} size={size} type={type}>
    {children}
  </StyledButton>
);

export default Button;

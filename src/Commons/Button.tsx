import StyledButton from "./Styles/StyledButton";
import ButtonProps from "@/Types/ButtonTypes";

const Button = ({
  color,
  size,
  type,
  handleClick,
  children,
}: ButtonProps) => (
  <StyledButton handleClick={handleClick} color={color} size={size} type={type}>
    {children}
  </StyledButton>
);

export default Button;

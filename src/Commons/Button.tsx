import StyledButton from "./Styles/StyledButton";
import ButtonProps from "@/Types/ButtonTypes";

const ReusableButton = ({
  color,
  size,
  type,
  handleClick,
  children,
  disabled,
}: ButtonProps) => (
  <StyledButton handleClick={handleClick} color={color} size={size} type={type} disabled={disabled}>
    {children}
  </StyledButton>
);

export default ReusableButton;

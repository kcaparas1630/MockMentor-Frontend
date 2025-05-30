import StyledButton from "./Styles/StyledButton";
import ButtonProps from "@/Types/ButtonTypes";

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

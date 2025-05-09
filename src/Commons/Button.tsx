import StyledButton from "./Styles/StyledButton";
import ButtonProps from "@/Types/ButtonTypes";

const ReusableButton = ({
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

export default ReusableButton;

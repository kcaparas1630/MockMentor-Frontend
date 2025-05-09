import { FC } from "react";
import InputProps from "../Types/Forms/Input";
import { Label, InputField, InputContainer } from "./Styles/StyledInput";

const ReusableInput: FC<InputProps> = ({ name, type, placeholder, label, value, onChange }) => {

  return (
    <InputContainer>
      <Label htmlFor={name}>{label}</Label>
      <InputField type={type} placeholder={placeholder} value={value} onChange={onChange} />
    </InputContainer>
  );
};

export default ReusableInput;

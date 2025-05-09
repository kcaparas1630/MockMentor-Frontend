import { FC } from "react";
import InputProps from "../Types/Forms/Input";
import { Label, InputField, InputContainer } from "./Styles/StyledInput";
import { useFormContext } from "react-hook-form";

const ReusableInput: FC<InputProps> = ({ name, type, placeholder, label }) => {
  const { register } = useFormContext();
  return (
    <InputContainer>
      <Label htmlFor={name}>{label}</Label>
      <InputField type={type} placeholder={placeholder} {...register(name)} />
    </InputContainer>
  );
};

export default ReusableInput;

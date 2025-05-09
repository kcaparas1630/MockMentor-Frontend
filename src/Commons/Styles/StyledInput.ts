import styled from "@emotion/styled";

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #27272A;
`;

const InputField = styled.input`
  width: 95.5%;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #E4E4E7;
  background-color: #FFFFFF;
  color: #000000;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #A1A1AA;
    box-shadow: 0 0 0 2px rgba(161, 161, 170, 0.3);
  }

  &::placeholder {
    color: #A1A1AA;
  }
`;

export {
  InputContainer,
  Label,
  InputField,
};

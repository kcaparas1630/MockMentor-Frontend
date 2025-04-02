import IsDarkMode from "@/Types/IsDarkMode";
import styled from "@emotion/styled";

const SignUpContainer = styled.div<IsDarkMode>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#1C1C1C" : "#FFFFFF")};
  border-radius: 0.625rem;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    max-width: 100%;
    padding: 1rem;
  }
`;

const Title = styled.h2<IsDarkMode>`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ isDarkMode }) => (isDarkMode ? "#FFFFFF" : "#000000")};
`;

const Description = styled.p<IsDarkMode>`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  color: ${({ isDarkMode }) => (isDarkMode ? "#A1A1AA" : "#71717A")};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label<IsDarkMode>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ isDarkMode }) => (isDarkMode ? "#E4E4E7" : "#27272A")};
`;

const Input = styled.input<IsDarkMode>`
  width: 95.5%;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#E4E4E7")};
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#27272A" : "#FFFFFF")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#FFFFFF" : "#000000")};
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ isDarkMode }) => (isDarkMode ? "#A1A1AA" : "#71717A")};
    box-shadow: 0 0 0 2px
      ${({ isDarkMode }) =>
        isDarkMode ? "rgba(161, 161, 170, 0.3)" : "rgba(113, 113, 122, 0.3)"};
  }

  &::placeholder {
    color: ${({ isDarkMode }) => (isDarkMode ? "#71717A" : "#A1A1AA")};
  }
`;

const SignInLink = styled.a<IsDarkMode>`
  font-size: 0.875rem;
  color: ${({ isDarkMode }) => (isDarkMode ? "#A1A1AA" : "#71717A")};
  text-align: center;
  margin-top: 1rem;

  span {
    color: ${({ isDarkMode }) => (isDarkMode ? "#FFFFFF" : "#000000")};
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const GoogleButton = styled.button<IsDarkMode>`
  width: 100%;
  padding: 0.625rem;
  border-radius: 0.375rem;
  border: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#E4E4E7")};
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#27272A" : "#FFFFFF")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#FFFFFF" : "#000000")};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${({ isDarkMode }) =>
      isDarkMode ? "#323232" : "#F9F9F9"};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px
      ${({ isDarkMode }) =>
        isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)"};
  }
`;

const Divider = styled.div<IsDarkMode>`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: ${({ isDarkMode }) => (isDarkMode ? "#A1A1AA" : "#71717A")};
  font-size: 0.875rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid
      ${({ isDarkMode }) =>
        isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#E4E4E7"};
  }

  &::before {
    margin-right: 0.5rem;
  }

  &::after {
    margin-left: 0.5rem;
  }
`;

export {
  SignUpContainer,
  Title,
  Description,
  Form,
  InputGroup,
  Label,
  Input,
  SignInLink,
  GoogleButton,
  Divider,
};

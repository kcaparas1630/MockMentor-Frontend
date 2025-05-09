import styled from "@emotion/styled";

const SignUpContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: 1.5rem;
  background-color: #FFFFFF;
  border-radius: 0.625rem;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    max-width: 100%;
    padding: 1rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #000000;
`;

const Description = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  color: #71717A;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SignInLink = styled.a`
  font-size: 0.875rem;
  color: #A1A1AA;
  text-align: center;
  margin-top: 1rem;

  span {
    color: #000000;
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 0.625rem;
  border-radius: 0.375rem;
  border: 1px solid #E4E4E7;
  background-color: #FFFFFF;
  color: #000000;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: #F9F9F9;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: #A1A1AA;
  font-size: 0.875rem;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #E4E4E7;
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
  SignInLink,
  GoogleButton,
  Divider,
};

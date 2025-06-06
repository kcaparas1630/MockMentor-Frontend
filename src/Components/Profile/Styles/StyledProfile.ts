import styled from "@emotion/styled";

const ProfileContainer = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-width: 100vw;
    width: 100vw;
    padding: 1rem;
    box-sizing: border-box;
    overflow-y: auto;
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
  width: 80vw;

  @media (min-width: 1024px) {
    width: 30vw;
  }
`;

export { ProfileContainer, Form, InputGroup };

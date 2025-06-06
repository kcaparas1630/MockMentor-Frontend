import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

const respectsReducedMotion = `
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
`;

// Animation keyframes
const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const hoverScale = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.02);
  }
`;

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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min(90vw, 600px);
  height: min(70vh, 600px);
  min-height: 400px;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 2rem;
  box-sizing: border-box;
  animation: ${scaleIn} 0.4s ease-out;

  @media (min-width: 1024px) {
    min-height: 30vw;
    max-width: 40vw;
    width: min(40vw, 600px);
    height: min(40vh, 600px);
  }
  ${respectsReducedMotion}
`;

const FormHeaderGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const FormHeader = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #000;
  text-align: center;
  margin: 0;
  animation: ${scaleIn} 0.4s ease-out;
  ${respectsReducedMotion}
`;
const FormSubHeader = styled.h2`
  font-size: 1.2rem;
  font-weight: 400;
  color: #000;
  text-align: center;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  button {
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      animation: ${hoverScale} 0.2s ease forwards;
    }
  }

  @media (min-width: 1024px) {
    flex-direction: row;
  }
  ${respectsReducedMotion}
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: min(80vw, 400px);
  animation: ${fadeIn} 0.5s ease-out;

  @media (min-width: 1024px) {
    width: min(30vw, 500px);
  }
  ${respectsReducedMotion}
`;
const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// Progress Indicator Styled Components
const ProgressContainer = styled.div`
  width: 100%;
  max-width: 28rem;
  margin: 0 auto 2rem auto;
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const ProgressDot = styled.div<{ isActive: boolean }>`
  height: 0.5rem;
  width: 2rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
  background-color: ${(props) => (props.isActive ? "#1f2937" : "#e5e7eb")};
  ${respectsReducedMotion}
`;

export {
  ProfileContainer,
  Form,
  FormGroup,
  FormContainer,
  ButtonGroup,
  FormHeader,
  FormSubHeader,
  FormHeaderGroup,
  ProgressContainer,
  ProgressIndicator,
  ProgressDot,
  InputGroup,
};

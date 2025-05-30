import styled from "@emotion/styled";

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #2C2F33;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border: 3px solid #2C2F33;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Spinner;

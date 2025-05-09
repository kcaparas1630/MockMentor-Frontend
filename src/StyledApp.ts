import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  background-color: #e5e5f7;
  opacity: 0.8;
  background-image: linear-gradient(#71717a 1px, transparent 1px),
    linear-gradient(to right, #71717a 1px, #e5e5f7 1px);
  background-size: 20px 20px;
`;

const ThemeToggle = styled.button`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #e4e4e7;
  background-color: #ffffff;
  color: #000000;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export { Container, ThemeToggle };

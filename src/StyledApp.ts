import styled from "@emotion/styled";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ isDarkMode }: { isDarkMode: boolean }) =>
    isDarkMode ? "#000000" : "#F4F4F5"};
  transition: background-color 0.3s;
`;

const ThemeToggle = styled.button`
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid
    ${({ isDarkMode }: { isDarkMode: boolean }) =>
      isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#E4E4E7"};
  background-color: ${({ isDarkMode }: { isDarkMode: boolean }) =>
    isDarkMode ? "#27272A" : "#FFFFFF"};
  color: ${({ isDarkMode }: { isDarkMode: boolean }) =>
    isDarkMode ? "#FFFFFF" : "#000000"};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export { Container, ThemeToggle };

import { useState } from "react";
import styled from "@emotion/styled";

const Container = styled.div<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => isDarkMode ? '#1a202c' : '#f7fafc'};
  color: ${({ isDarkMode }) => isDarkMode ? '#f7fafc' : '#1a202c'};
`;

const Button = styled.button<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => isDarkMode ? '#1a202c' : '#f7fafc'};
  color: ${({ isDarkMode }) => isDarkMode ? '#f7fafc' : '#1a202c'};
`;

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  }

  return (
    <Container isDarkMode={isDarkMode}>
      <h1>Hello World</h1>
      <Button type="button" isDarkMode={isDarkMode} onClick={toggleDarkMode}>Toggle Dark Mode</Button>
    </Container>
  )
}

export default App;

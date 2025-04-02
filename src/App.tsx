import { useState } from "react";
import SignUpForm from "./Components/Auth/SignUpForm";
import { Container, ThemeToggle } from "./StyledApp";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <Container isDarkMode={isDarkMode}>
      <ThemeToggle
        isDarkMode={isDarkMode}
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </ThemeToggle>
      <SignUpForm isDarkMode={isDarkMode} />
    </Container>
  );
}

export default App;

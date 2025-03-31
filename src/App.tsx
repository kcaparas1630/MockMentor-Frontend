// This is a sample. It will be replaced with the actual code. 
import { Dispatch, SetStateAction, useState } from "react";

const DarkModeToggle = ({ isDarkMode, setIsDarkMode }: { 
  isDarkMode: boolean, 
  setIsDarkMode: Dispatch<SetStateAction<boolean>> 
}) => {
  const handleDarkModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  }
  return <button className="bg-white dark:bg-black text-black dark:text-white" onClick={handleDarkModeToggle}>Toggle Dark Mode</button>
}

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  return (
    <div className={`${isDarkMode ? 'text-white bg-black' : 'text-black bg-white'}`}>
      <h1 className={`${isDarkMode ? 'text-white' : 'text-black'}`}> Hello World </h1>
      <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
    </div>
  )
}

export default App

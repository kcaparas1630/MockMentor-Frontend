import IsDarkMode from "./IsDarkMode";

type ButtonColorTypes = "primary" | "secondary" | "tertiary";

type ButtonSizeTypes = "sm" | "md" | "lg";

type ButtonTypes = "button" | "submit" | "reset";


interface ButtonProps extends IsDarkMode {
    color: ButtonColorTypes;
    size: ButtonSizeTypes;
    type: ButtonTypes;
    handleClick: () => void;
    children?: React.ReactNode;
}

export default ButtonProps;

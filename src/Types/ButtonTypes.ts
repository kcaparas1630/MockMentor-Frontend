type ButtonColorTypes = "primary" | "secondary" | "tertiary";

type ButtonSizeTypes = "sm" | "md" | "lg";

type ButtonTypes = "button" | "submit" | "reset";


interface ButtonProps {
    color: ButtonColorTypes;
    size: ButtonSizeTypes;
    type: ButtonTypes;
    handleClick: () => void;
    children?: React.ReactNode;
}

export default ButtonProps;

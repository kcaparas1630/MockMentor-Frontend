type ButtonColorTypes = "primary" | "secondary" | "tertiary";

type ButtonSizeTypes = "sm" | "md" | "lg";

type ButtonTypes = "button" | "submit" | "reset";


interface ButtonProps {
    color: ButtonColorTypes;
    size: ButtonSizeTypes;
    type: ButtonTypes;
    onClick?: () => void;
    children?: React.ReactNode;
    disabled?: boolean;
}

export default ButtonProps;

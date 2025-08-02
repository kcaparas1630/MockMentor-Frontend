interface TextAreaProps {
  name: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
  resizable?: boolean;
}

export default TextAreaProps;

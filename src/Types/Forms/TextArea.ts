interface TextAreaProps {
  name: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
}

export default TextAreaProps;

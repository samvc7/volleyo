import { Col, Form } from "react-bootstrap";
import "./InputGroup.scss";

interface InputGroupProps {
  label: string;
  type: string;
  name: string;
  value: string | number | string[];
  onChange: React.ChangeEventHandler;
  isInvalid?: boolean;
  ariaInvalid?: boolean; 
  error?: string;
  mdSize: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  isInvalid,
  ariaInvalid,
  error,
  mdSize
}) => {
  return(
  <Form.Group as={Col} md={mdSize} controlId={`validation${name}`}>
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      aria-invalid={ariaInvalid}
      isInvalid={isInvalid}
    />
    <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
  </Form.Group>
)};

export default InputGroup;
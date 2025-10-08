import { Form, InputGroup } from "react-bootstrap";

type FilterBarProps = {
  placeholder?: string;
  onChange?: (value: string) => void;
};

export function FilterBar({ placeholder = "Search...", onChange }: FilterBarProps) {
  return (
    <InputGroup>
      <InputGroup.Text aria-hidden="true">🔍</InputGroup.Text>
      <Form.Control
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </InputGroup>
  );
}

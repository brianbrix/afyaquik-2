import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { useId, type ChangeEvent, type ReactNode } from "react";

export type FilterValue = string | boolean | null | undefined;

export type FilterBarValues = Record<string, FilterValue>;

type BaseFieldConfig = {
  key: string;
  label?: string;
  col?: number;
  description?: string;
};

export type SearchFieldConfig = BaseFieldConfig & {
  type: "search";
  placeholder?: string;
  icon?: ReactNode;
};

export type TextFieldConfig = BaseFieldConfig & {
  type: "text";
  placeholder?: string;
};

export type SelectFieldConfig = BaseFieldConfig & {
  type: "select";
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  clearable?: boolean;
};

export type DateFieldConfig = BaseFieldConfig & {
  type: "date";
  min?: string;
  max?: string;
};

export type ToggleFieldConfig = BaseFieldConfig & {
  type: "toggle";
  label: string;
  description?: string;
};

export type FilterFieldConfig =
  | SearchFieldConfig
  | TextFieldConfig
  | SelectFieldConfig
  | DateFieldConfig
  | ToggleFieldConfig;

// Full featured configuration-driven filter bar props
export type FilterBarProps = {
  fields: FilterFieldConfig[];
  values: FilterBarValues;
  onChange: (values: FilterBarValues) => void;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
  resetLabel?: string;
};

// Backward-compatible simple search mode props (legacy usage in pages still using <FilterBar placeholder="..." />)
export type SimpleFilterBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

type CombinedProps = FilterBarProps | SimpleFilterBarProps;

const DEFAULT_RESET_LABEL = "Reset";

export function FilterBar(props: CombinedProps) {
  // Detect simple mode by absence of 'fields' key
  if (!('fields' in props)) {
    const { placeholder = 'Search', value = '', onChange, className } = props as SimpleFilterBarProps;
    const id = useId();
    return (
      <div className={className}>
        <Form.Control
          id={id}
          type="search"
            placeholder={placeholder}
            aria-label={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
    );
  }

  const {
    fields,
    values,
    onChange,
    onReset,
    className,
    showReset = true,
    resetLabel = DEFAULT_RESET_LABEL
  } = props as FilterBarProps;
  const componentId = useId();

  const handleValueChange = (fieldKey: string, nextValue: FilterValue) => {
    const nextValues: FilterBarValues = { ...values };
    if (nextValue === undefined) {
      delete nextValues[fieldKey];
    } else {
      nextValues[fieldKey] = nextValue;
    }
    onChange(nextValues);
  };

  return (
    <div className={className}>
      <Row className="g-3 align-items-end">
        {fields.map((fieldConfig) => {
          const colSpan = fieldConfig.col ?? 3;
          const fieldValue = values[fieldConfig.key];
          const controlId = `${componentId}-${fieldConfig.key}`;

          switch (fieldConfig.type) {
            case "search": {
              const placeholder = fieldConfig.placeholder ?? "Search";
              return (
                <Col key={fieldConfig.key} md={colSpan} sm={12}>
                  {fieldConfig.label && <Form.Label className="fw-semibold">{fieldConfig.label}</Form.Label>}
                  <InputGroup>
                    <InputGroup.Text aria-hidden="true">
                      {fieldConfig.icon ?? "🔍"}
                    </InputGroup.Text>
                    <Form.Control
                      id={controlId}
                      type="search"
                      placeholder={placeholder}
                      aria-label={placeholder}
                      value={typeof fieldValue === "string" ? fieldValue : ""}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        handleValueChange(fieldConfig.key, event.target.value)
                      }
                    />
                  </InputGroup>
                  {fieldConfig.description && (
                    <Form.Text className="text-muted">{fieldConfig.description}</Form.Text>
                  )}
                </Col>
              );
            }
            case "text": {
              return (
                <Col key={fieldConfig.key} md={colSpan} sm={12}>
                  {fieldConfig.label && <Form.Label className="fw-semibold" htmlFor={controlId}>{fieldConfig.label}</Form.Label>}
                  <Form.Control
                    id={controlId}
                    type="text"
                    placeholder={fieldConfig.placeholder}
                    value={typeof fieldValue === "string" ? fieldValue : ""}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleValueChange(fieldConfig.key, event.target.value)
                    }
                  />
                  {fieldConfig.description && (
                    <Form.Text className="text-muted">{fieldConfig.description}</Form.Text>
                  )}
                </Col>
              );
            }
            case "select": {
              return (
                <Col key={fieldConfig.key} md={colSpan} sm={12}>
                  {fieldConfig.label && <Form.Label className="fw-semibold" htmlFor={controlId}>{fieldConfig.label}</Form.Label>}
                  <Form.Select
                    id={controlId}
                    value={typeof fieldValue === "string" ? fieldValue : ""}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      handleValueChange(
                        fieldConfig.key,
                        event.target.value === "" ? undefined : event.target.value
                      )
                    }
                  >
                    {fieldConfig.placeholder && <option value="">{fieldConfig.placeholder}</option>}
                    {fieldConfig.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                  {fieldConfig.description && (
                    <Form.Text className="text-muted">{fieldConfig.description}</Form.Text>
                  )}
                </Col>
              );
            }
            case "date": {
              return (
                <Col key={fieldConfig.key} md={colSpan} sm={12}>
                  {fieldConfig.label && <Form.Label className="fw-semibold" htmlFor={controlId}>{fieldConfig.label}</Form.Label>}
                  <Form.Control
                    id={controlId}
                    type="date"
                    value={typeof fieldValue === "string" ? fieldValue : ""}
                    min={fieldConfig.min}
                    max={fieldConfig.max}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleValueChange(fieldConfig.key, event.target.value || undefined)
                    }
                  />
                  {fieldConfig.description && (
                    <Form.Text className="text-muted">{fieldConfig.description}</Form.Text>
                  )}
                </Col>
              );
            }
            case "toggle": {
              return (
                <Col key={fieldConfig.key} md={colSpan} sm={12}>
                  <Form.Check
                    id={controlId}
                    type="switch"
                    label={fieldConfig.label}
                    checked={typeof fieldValue === "boolean" ? fieldValue : false}
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      handleValueChange(fieldConfig.key, event.target.checked)
                    }
                  />
                  {fieldConfig.description && (
                    <Form.Text className="text-muted">{fieldConfig.description}</Form.Text>
                  )}
                </Col>
              );
            }
            default:
              return null;
          }
        })}

        {showReset && onReset && (
          <Col xs={12} className="d-flex justify-content-end">
            <Button variant="outline-secondary" onClick={onReset}>
              {resetLabel}
            </Button>
          </Col>
        )}
      </Row>
    </div>
  );
}

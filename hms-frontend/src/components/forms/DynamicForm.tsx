import { Form } from "react-bootstrap";
import { useId } from "react";
import RichTextEditor from "../shared/RichTextEditor";

export type DynamicFieldType = "text" | "textarea" | "select" | "date" | "number" | "rich_text";

export interface DynamicFieldBase {
  name: string;
  label: string;
  type: DynamicFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface DynamicSelectOption {
  value: string;
  label: string;
}

export interface DynamicSelectField extends DynamicFieldBase {
  type: "select";
  options: DynamicSelectOption[];
}

export type DynamicField = DynamicFieldBase | DynamicSelectField;

export interface DynamicFormProps {
  fields: DynamicField[];
  values?: Record<string, unknown>;
  disabled?: boolean;
}

export function DynamicForm({ fields, values, disabled }: DynamicFormProps) {
  const baseId = useId();
  return (
    <div className="d-flex flex-column gap-3">
      {fields.map((field) => {
        const controlId = `${baseId}-${field.name}`;
        const common = {
          name: field.name,
          required: field.required,
          disabled,
          defaultValue: (values && values[field.name]) as any,
          placeholder: field.placeholder
        };
        return (
          <Form.Group controlId={controlId} key={field.name}>
            <Form.Label>{field.label}</Form.Label>
            {field.type === "textarea" ? (
              <Form.Control as="textarea" rows={3} {...common} />
            ) : field.type === "rich_text" ? (
              <RichTextEditor
                value={(values && values[field.name]) as string || ''}
                onChange={(value) => {
                  // Handle rich text change
                  const event = new Event('change', { bubbles: true });
                  const target = document.getElementById(controlId) as HTMLInputElement;
                  if (target) {
                    target.value = value;
                    target.dispatchEvent(event);
                  }
                }}
                placeholder={field.placeholder}
                theme="snow"
                style={{ background: 'white' }}
              />
            ) : field.type === "select" && (field as DynamicSelectField).options ? (
              <Form.Select {...common}>
                <option value="">Select...</option>
                {(field as DynamicSelectField).options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control type={field.type === "date" ? "date" : field.type} {...common} />
            )}
            {field.helpText && (
              <Form.Text className="text-muted">{field.helpText}</Form.Text>
            )}
          </Form.Group>
        );
      })}
    </div>
  );
}

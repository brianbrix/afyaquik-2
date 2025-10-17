import { Form } from "react-bootstrap";
import { useId, useEffect, useState } from "react";
import RichTextEditor from "../shared/RichTextEditor";
import { apiClient } from "../../services/apiClient";

export type DynamicFieldType = "text" | "textarea" | "select" | "date" | "number" | "rich_text";

export interface DynamicFieldBase {
  name: string;
  label: string;
  type: DynamicFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  dependsOn?: string; // For cascading select fields
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
  onChange?: (name: string, value: any) => void;
}

export function DynamicForm({ fields, values, disabled, onChange }: DynamicFormProps) {
  const baseId = useId();
  const [insurancePlans, setInsurancePlans] = useState<DynamicSelectOption[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Handle cascading select for insurance plans
  useEffect(() => {
    const insuranceProviderField = fields.find(f => f.name === 'insuranceProvider');
    const insurancePlanField = fields.find(f => f.name === 'insurancePlan');
    
    if (insuranceProviderField && insurancePlanField && values?.insuranceProvider) {
      const providerId = values.insuranceProvider;
      if (providerId) {
        setLoadingPlans(true);
        apiClient.get(`/insurance/providers/${providerId}/plans`)
          .then(res => {
            const plans = res.data?.data || [];
            setInsurancePlans(plans.map((plan: any) => ({
              value: plan.id.toString(),
              label: plan.name
            })));
          })
          .catch(err => {
            console.error('Error loading insurance plans:', err);
            setInsurancePlans([]);
          })
          .finally(() => setLoadingPlans(false));
      } else {
        setInsurancePlans([]);
      }
    }
  }, [values?.insuranceProvider, fields]);

  return (
    <div className="d-flex flex-column gap-3">
      {fields.map((field) => {
        const controlId = `${baseId}-${field.name}`;
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
          if (onChange) {
            onChange(field.name, e.target.value);
          }
        };

        const common = {
          name: field.name,
          required: field.required,
          disabled,
          value: (values && values[field.name]) as any || '',
          placeholder: field.placeholder,
          onChange: handleChange
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
                  if (onChange) {
                    onChange(field.name, value);
                  }
                }}
                placeholder={field.placeholder}
                theme="snow"
                style={{ background: 'white' }}
              />
            ) : field.type === "select" && (field as DynamicSelectField).options ? (
              <Form.Select {...common} disabled={field.name === 'insurancePlan' && loadingPlans}>
                <option value="">Select...</option>
                {field.name === 'insurancePlan' && field.dependsOn === 'insuranceProvider' ? (
                  insurancePlans.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))
                ) : (
                  (field as DynamicSelectField).options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))
                )}
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

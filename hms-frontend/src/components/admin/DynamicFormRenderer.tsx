import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import RichTextEditor from '../shared/RichTextEditor';

// Schema interface expectation (from backend schemaJson string)
// Expecting a JSON like: { title?: string, fields: [{ name, label, type, required?, options? }] }
interface FieldDef { 
  name: string; 
  label: string; 
  type: string; // text, number, textarea, select, richtext, date, datetime, checkbox, radio, multiselect
  required?: boolean; 
  options?: { value: string; label: string }[]; // for select/radio/multiselect
  defaultValue?: any;
}
interface FormSchema { title?: string; fields: FieldDef[] }

interface DynamicFormRendererProps { schemaJson: string; onSubmit?: (values: any) => void; readOnly?: boolean }

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({ schemaJson, onSubmit, readOnly }) => {
  const schema: FormSchema | null = useMemo(()=> {
    try { return JSON.parse(schemaJson); } catch { return null; }
  }, [schemaJson]);
  const { register, handleSubmit, control, formState: { errors } } = useForm({ mode: 'onBlur' });
  if (!schema) return <div className="text-danger small">Invalid schema</div>;

  const submit = (data: any) => { onSubmit?.(data); };

  return (
    <form onSubmit={handleSubmit(submit)} className="d-flex flex-column gap-3">
      {schema.title && <h6 className="mb-0">{schema.title}</h6>}
      {schema.fields?.map(f => {
        const common = { 'aria-invalid': errors[f.name] ? 'true' : 'false' } as any;
        const label = <label className="form-label form-label-sm mb-1">{f.label}{f.required && <span className="text-danger ms-1">*</span>}</label>;
        return (
          <div key={f.name}>
            {label}
            {f.type === 'text' && (
              <input className="form-control form-control-sm" disabled={readOnly} {...register(f.name, { required: f.required })} {...common} />
            )}
            {f.type === 'number' && (
              <input type="number" className="form-control form-control-sm" disabled={readOnly} {...register(f.name, { required: f.required, valueAsNumber: true })} {...common} />
            )}
            {f.type === 'textarea' && (
              <textarea className="form-control form-control-sm" disabled={readOnly} rows={3} {...register(f.name, { required: f.required })} {...common} />
            )}
            {f.type === 'select' && (
              <select className="form-select form-select-sm" disabled={readOnly} {...register(f.name, { required: f.required })} {...common}>
                <option value="">-- select --</option>
                {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            {f.type === 'multiselect' && (
              <select multiple className="form-select form-select-sm" disabled={readOnly} {...register(f.name, { required: f.required })} {...common}>
                {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            {f.type === 'date' && (
              <input type="date" className="form-control form-control-sm" disabled={readOnly} {...register(f.name, { required: f.required })} {...common} />
            )}
            {f.type === 'datetime' && (
              <input type="datetime-local" className="form-control form-control-sm" disabled={readOnly} {...register(f.name, { required: f.required })} {...common} />
            )}
            {f.type === 'checkbox' && (
              <div className="form-check">
                <input type="checkbox" className="form-check-input" disabled={readOnly} {...register(f.name, { required: f.required })} {...common} />
              </div>
            )}
            {f.type === 'radio' && (
              <div className="d-flex flex-wrap gap-3">
                {f.options?.map(o => (
                  <div className="form-check form-check-inline" key={o.value}>
                    <input className="form-check-input" type="radio" value={o.value} disabled={readOnly} {...register(f.name, { required: f.required })} />
                    <label className="form-check-label small">{o.label}</label>
                  </div>
                ))}
              </div>
            )}
            {f.type === 'richtext' && (
              <Controller name={f.name} control={control} rules={{ required: f.required }} render={({ field }) => (
                <RichTextEditor theme="snow" readOnly={!!readOnly} value={field.value||''} onChange={field.onChange} />
              )} />
            )}
            {errors[f.name] && <div className="text-danger small mt-1">This field is required</div>}
          </div>
        );
      })}
      {!readOnly && (
        <div>
          <button type="submit" className="btn btn-sm btn-primary">Submit</button>
        </div>
      )}
    </form>
  );
};

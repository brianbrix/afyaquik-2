import React, { useEffect, useState } from 'react';
import { useFormSchema } from '../../services/configApi';
import { DynamicFormRenderer } from './DynamicFormRenderer';

// Example usage: loads a schema and logs it (placeholder for future dynamic form render)
export const DynamicFormSample: React.FC<{ formKey: string }> = ({ formKey }) => {
  const { data: schema, isLoading } = useFormSchema(formKey);
  const [submitted, setSubmitted] = useState<any|null>(null);
  useEffect(() => { if (schema) { console.debug('Loaded form schema', formKey, schema); } }, [schema, formKey]);
  if (isLoading) return <div className="text-muted small">Loading schema...</div>;
  if (!schema) return <div className="text-muted small">No schema defined for {formKey}</div>;
  return (
    <div className="border rounded p-3 bg-white">
      <DynamicFormRenderer schemaJson={schema.schemaJson} onSubmit={(vals)=>setSubmitted(vals)} />
      {submitted && (
        <div className="mt-3 small">
          <div className="fw-semibold">Submitted Data</div>
          <pre className="bg-light p-2 border rounded" style={{maxHeight:150, overflow:'auto'}}>{JSON.stringify(submitted, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

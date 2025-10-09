import React, { useState } from 'react';
import { useFormSchema } from '../../services/configApi';
import { DynamicFormRenderer } from './DynamicFormRenderer';
import { useParams } from 'react-router-dom';

// This page demonstrates wiring a dynamic form into the admin area (re-usable pattern for future patient intake, etc.)
export const DynamicFormPage: React.FC<{ formKey?: string }> = ({ formKey: propFormKey }) => {
  const params = useParams();
  const effectiveKey = propFormKey || params.formKey || '';
  const { data: schema, isLoading } = useFormSchema(effectiveKey);
  const [lastSubmit, setLastSubmit] = useState<any|null>(null);
  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Dynamic Form: <code>{effectiveKey}</code></h5>
      </div>
      {isLoading && <div className="text-muted small">Loading schema...</div>}
      {!isLoading && !schema && <div className="alert alert-warning py-2 small mb-0">No schema found for <code>{effectiveKey}</code></div>}
      {schema && (
        <div className="card card-body">
          <DynamicFormRenderer schemaJson={schema.schemaJson} onSubmit={setLastSubmit} />
        </div>
      )}
      {lastSubmit && (
        <div className="card card-body bg-light">
          <h6 className="mb-2">Most Recent Submission</h6>
          <pre className="small mb-0" style={{maxHeight:200, overflow:'auto'}}>{JSON.stringify(lastSubmit, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

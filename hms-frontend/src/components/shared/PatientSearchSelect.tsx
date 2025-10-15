import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { patientSearchApi, PatientSearchResult } from '../../services/patientSearchApi';

interface PatientSearchSelectProps {
  value?: PatientSearchResult | null;
  onChange: (patient: PatientSearchResult | null) => void;
  placeholder?: string;
  required?: boolean;
}

export const PatientSearchSelect: React.FC<PatientSearchSelectProps> = ({
  value,
  onChange,
  placeholder = "Search patients by name, phone, email, or ID...",
  required = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const searchResults = await patientSearchApi.searchPatients(query);
        setResults(searchResults);
        setShowResults(true);
      } catch (err: any) {
        setError('Failed to search patients');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!e.target.value) {
      onChange(null);
    }
  };

  const handlePatientSelect = (patient: PatientSearchResult) => {
    onChange(patient);
    setQuery(`${patient.firstName} ${patient.lastName}`);
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200);
  };

  const formatPatientInfo = (patient: PatientSearchResult) => {
    const info = [];
    if (patient.mrn) info.push(`MRN: ${patient.mrn}`);
    if (patient.phone) info.push(`Phone: ${patient.phone}`);
    if (patient.email) info.push(`Email: ${patient.email}`);
    if (patient.nationalId) info.push(`ID: ${patient.nationalId}`);
    return info.join(' • ');
  };

  return (
    <div className="position-relative">
      <Form.Control
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="position-absolute top-50 end-0 translate-middle-y me-3">
          <Spinner size="sm" />
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
          {error}
        </Alert>
      )}

      {showResults && results.length > 0 && (
        <ListGroup className="position-absolute w-100" style={{ zIndex: 1000, maxHeight: '300px', overflowY: 'auto' }}>
          {results.map((patient) => (
            <ListGroup.Item
              key={patient.id}
              action
              onClick={() => handlePatientSelect(patient)}
              className="py-2"
            >
              <div className="fw-semibold">
                {patient.firstName} {patient.lastName}
              </div>
              <small className="text-muted">
                {formatPatientInfo(patient)}
              </small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {showResults && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="position-absolute w-100 bg-white border rounded shadow-sm p-3" style={{ zIndex: 1000 }}>
          <div className="text-muted text-center">No patients found</div>
        </div>
      )}
    </div>
  );
};

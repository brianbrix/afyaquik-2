import React, { useState } from 'react';
import RichTextEditor from '../shared/RichTextEditor';
import { Button, Form, Row, Col, InputGroup } from 'react-bootstrap';

interface TriageItem {
  id: number;
  title: string;
  details: string;
  isCustom: boolean;
}

import type { TriageTitleDto } from '../../services/triageTitlesApi';
interface TriageActionsSectionProps {
  triageTitles: TriageTitleDto[];
  initialItems?: TriageItem[];
  onChange?: (items: TriageItem[]) => void;
  onSubmit?: (items: TriageItem[]) => void | Promise<void>;
  loading?: boolean;
}

export const TriageActionsSection: React.FC<TriageActionsSectionProps> = ({ triageTitles, initialItems = [], onChange, onSubmit, loading }) => {
  const [items, setItems] = useState<TriageItem[]>(initialItems);
  // Sync items state with initialItems prop
  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  const [customTitle, setCustomTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddItem = (title: string, isCustom = false) => {
    if (!title.trim()) return;
    const newItem: TriageItem = {
      id: Date.now() + Math.random(),
      title,
      details: '',
      isCustom
    };
    const updated = [...items, newItem];
    setItems(updated);
    onChange?.(updated);
    setCustomTitle('');
  };

  const handleRemoveItem = (id: number) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    onChange?.(updated);
  };

  const handleDetailsChange = (id: number, details: string) => {
    const updated = items.map(i => i.id === id ? { ...i, details } : i);
    setItems(updated);
    onChange?.(updated);
  };

  return (
    <div className="mb-2">
      <div className="fw-semibold mb-2">Triage Actions</div>
      <Form.Group as={Row} className="mb-2 align-items-center">
        <Col sm={6}>
          <Form.Select onChange={e => handleAddItem(e.target.value)} defaultValue="">
            <option value="">Add from configured titles...</option>
            {triageTitles.map(t => (
              <option key={t.id} value={t.title}>{t.title}</option>
            ))}
          </Form.Select>
        </Col>
        <Col sm={6}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Custom title..."
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
            />
            <Button variant="outline-primary" onClick={() => handleAddItem(customTitle, true)} disabled={!customTitle.trim()}>
              Add Custom
            </Button>
          </InputGroup>
        </Col>
      </Form.Group>
      {items.length === 0 && <div className="text-muted small mb-2">No triage items added yet.</div>}
      {items.map((item, idx) => (
        <div key={item.id} className="border rounded p-2 mb-2 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-semibold">{item.title}</span>
            <Button size="sm" variant="outline-danger" onClick={() => handleRemoveItem(item.id)}>
              Remove
            </Button>
          </div>
          <RichTextEditor
            theme="snow"
            value={item.details}
            onChange={val => handleDetailsChange(item.id, val)}
            placeholder="Enter details..."
            style={{ background: 'white' }}
          />
        </div>
      ))}
      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="primary"
          onClick={async () => {
            if (!onSubmit) return;
            setSubmitting(true);
            await onSubmit(items);
            setSubmitting(false);
          }}
          disabled={submitting || loading}
        >
          {submitting || loading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { fetchConsultationTitles, createConsultationTitle, deleteConsultationTitle, updateConsultationTitle, ConsultationTitleDto } from '../../services/consultationTitlesApi';
import { Button, Form, InputGroup, ListGroup, Spinner } from 'react-bootstrap';

export const ConsultationTitlesAdmin: React.FC = () => {
  const [titles, setTitles] = useState<ConsultationTitleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [editingValue, setEditingValue] = useState('');

  const loadTitles = async () => {
    setLoading(true);
    const data = await fetchConsultationTitles();
    setTitles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTitles();
  }, []);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setSubmitting(true);
    await createConsultationTitle(newTitle.trim());
    setNewTitle('');
    await loadTitles();
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    setSubmitting(true);
    await deleteConsultationTitle(id);
    await loadTitles();
    setSubmitting(false);
  };

  return (
    <div>
      <h5>Consultation Titles Management</h5>
      <InputGroup className="mb-3">
        <Form.Control
          type="text"
          placeholder="Add new consultation title..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          disabled={submitting}
        />
        <Button onClick={handleAdd} disabled={!newTitle.trim() || submitting} variant="primary">
          {submitting ? <Spinner size="sm" animation="border" /> : 'Add'}
        </Button>
      </InputGroup>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <ListGroup>
          {titles.map(t => (
            <ListGroup.Item key={t.id} className="d-flex justify-content-between align-items-center">
              {editingId === t.id ? (
                <InputGroup size="sm" style={{ maxWidth: 400 }}>
                  <Form.Control
                    value={editingValue}
                    onChange={e => setEditingValue(e.target.value)}
                    onKeyDown={async e => {
                      if (e.key === 'Enter') {
                        setSubmitting(true);
                        await updateConsultationTitle(t.id, editingValue.trim());
                        setEditingId(null);
                        setEditingValue('');
                        await loadTitles();
                        setSubmitting(false);
                      } else if (e.key === 'Escape') {
                        setEditingId(null);
                        setEditingValue('');
                      }
                    }}
                    autoFocus
                    disabled={submitting}
                  />
                  <Button
                    size="sm"
                    variant="success"
                    onClick={async () => {
                      setSubmitting(true);
                      await updateConsultationTitle(t.id, editingValue.trim());
                      setEditingId(null);
                      setEditingValue('');
                      await loadTitles();
                      setSubmitting(false);
                    }}
                    disabled={submitting || !editingValue.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setEditingId(null); setEditingValue(''); }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </InputGroup>
              ) : (
                <>
                  <span style={{ flex: 1, cursor: 'pointer' }} onClick={() => { setEditingId(t.id); setEditingValue(t.title); }}>{t.title}</span>
                  <Button size="sm" variant="outline-secondary" className="me-2" onClick={() => { setEditingId(t.id); setEditingValue(t.title); }} disabled={submitting}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(t.id)} disabled={submitting}>
                    Delete
                  </Button>
                </>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

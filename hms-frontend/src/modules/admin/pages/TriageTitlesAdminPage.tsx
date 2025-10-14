import React, { useState, useEffect } from 'react';
import { Button, Form, Table, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { fetchTriageTitles, updateTriageTitle, deleteTriageTitle, createTriageTitle, TriageTitleDto } from '../../../services/triageTitlesApi';

export function TriageTitlesAdminPage() {

  const [titles, setTitles] = useState<TriageTitleDto[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<number|null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTriageTitles()
      .then(setTitles)
      .catch(e => setError(e?.message || 'Failed to load triage titles'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title || titles.some(t => t.title === title)) return;
    setSaving(true);
    try {
      const created = await createTriageTitle(title);
      setTitles([...titles, created]);
      setNewTitle('');
    } catch (e: any) {
      setError(e?.message || 'Failed to add triage title');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: number) => {
    setSaving(true);
    try {
      await deleteTriageTitle(id);
      setTitles(titles.filter(t => t.id !== id));
    } catch (e: any) {
      setError(e?.message || 'Failed to delete triage title');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleEditSave = async (id: number) => {
    const trimmed = editingTitle.trim();
    if (!trimmed || titles.some(t => t.title === trimmed && t.id !== id)) return;
    setSaving(true);
    try {
      const updated = await updateTriageTitle(id, trimmed);
      setTitles(titles.map(t => t.id === id ? updated : t));
      setEditingId(null);
      setEditingTitle('');
    } catch (e: any) {
      setError(e?.message || 'Failed to update triage title');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <h2>Triage Item Titles</h2>
      <p className="text-muted">Configure the list of available triage item titles for staff to select during triage.</p>
      {error && <Alert variant="danger">{error}</Alert>}
      <InputGroup className="mb-3" style={{ maxWidth: 400 }}>
        <Form.Control
          type="text"
          placeholder="Add new title..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          disabled={saving}
        />
  <Button variant="primary" onClick={handleAdd} disabled={!newTitle.trim() || titles.some(t => t.title === newTitle.trim()) || saving}>
          {saving ? <Spinner size="sm" animation="border" /> : 'Add'}
        </Button>
      </InputGroup>
      {loading ? (
        <div className="text-center py-4"><Spinner animation="border" /></div>
      ) : (
        <Table bordered hover style={{ maxWidth: 500 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th style={{ width: 80 }}>Remove</th>
            </tr>
          </thead>
          <tbody>
            {titles.length === 0 ? (
              <tr><td colSpan={2} className="text-muted text-center">No titles configured.</td></tr>
            ) : (
              titles.map(t => (
                <tr key={t.id}>
                  <td>
                    {editingId === t.id ? (
                      <InputGroup size="sm">
                        <Form.Control
                          value={editingTitle}
                          onChange={e => setEditingTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleEditSave(t.id); }}
                          disabled={saving}
                          autoFocus
                        />
                        <Button size="sm" variant="success" onClick={() => handleEditSave(t.id)} disabled={saving}>Save</Button>
                        <Button size="sm" variant="secondary" onClick={() => { setEditingId(null); setEditingTitle(''); }} disabled={saving}>Cancel</Button>
                      </InputGroup>
                    ) : (
                      <span onClick={() => handleEdit(t.id, t.title)} style={{ cursor: 'pointer' }}>{t.title}</span>
                    )}
                  </td>
                  <td>
                    <Button size="sm" variant="outline-danger" onClick={() => handleRemove(t.id)} disabled={saving}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Spinner, Row, Col } from 'react-bootstrap';
import { fetchUserGroups, createUserGroup, updateUserGroup, deleteUserGroup, UserGroup } from './userGroupApi';
import { fetchGroupMembers, addGroupMembers, removeGroupMember, StaffUser } from './groupMembershipApi';
import { useStaffDirectory } from '../../../services/staffDirectoryApi';

export default function UserGroupAdminPage() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UserGroup | null>(null);
  const [form, setForm] = useState<Omit<UserGroup, 'id'>>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [members, setMembers] = useState<StaffUser[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const { data: allUsers = [] } = useStaffDirectory(true);

  const loadGroups = async () => {
    setLoading(true);
    setGroups(await fetchUserGroups());
    setLoading(false);
  };

  useEffect(() => { loadGroups(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };
  const openEdit = (g: UserGroup) => {
    setEditing(g);
    setForm({ name: g.name, description: g.description || '' });
    setShowModal(true);
  };
  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this group?')) {
      await deleteUserGroup(id);
      loadGroups();
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editing && editing.id) {
      await updateUserGroup(editing.id, form);
    } else {
      await createUserGroup(form);
    }
    setSaving(false);
    setShowModal(false);
    loadGroups();
  };

  // Group membership management
  const openMembers = async (group: UserGroup) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
    setMembers(await fetchGroupMembers(group.id!));
    setSelectedToAdd([]);
  };
  const handleAddMembers = async () => {
    if (!selectedGroup) return;
    setAdding(true);
    await addGroupMembers(selectedGroup.id!, selectedToAdd);
    setMembers(await fetchGroupMembers(selectedGroup.id!));
    setSelectedToAdd([]);
    setAdding(false);
  };
  const handleRemove = async (userId: number) => {
    if (!selectedGroup) return;
    await removeGroupMember(selectedGroup.id!, userId);
    setMembers(await fetchGroupMembers(selectedGroup.id!));
  };

  return (
    <div>
      <h2>User Groups</h2>
      <Button variant="primary" onClick={openCreate} className="mb-3">Create Group</Button>
      {loading ? <Spinner animation="border" /> : (
        <Table bordered hover>
          <thead>
            <tr><th>Name</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td>{g.description}</td>
                <td>
                  <Button size="sm" onClick={() => openEdit(g)} variant="outline-secondary" className="me-2">Edit</Button>
                  <Button size="sm" onClick={() => handleDelete(g.id!)} variant="outline-danger" className="me-2">Delete</Button>
                  <Button size="sm" onClick={() => openMembers(g)} variant="outline-primary">Members</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? 'Edit Group' : 'Create Group'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? <Spinner animation="border" size="sm" /> : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
      {/* Group Members Modal */}
      <Modal show={showMembersModal} onHide={() => setShowMembersModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Group Members: {selectedGroup?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6>Current Members</h6>
              <Table size="sm" bordered>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td>{m.displayName} <span className="text-muted">({m.username})</span></td>
                      <td><Button size="sm" variant="outline-danger" onClick={() => handleRemove(m.id)}>Remove</Button></td>
                    </tr>
                  ))}
                  {members.length === 0 && <tr><td colSpan={2} className="text-muted">No members</td></tr>}
                </tbody>
              </Table>
            </Col>
            <Col md={6}>
              <h6>Add Users</h6>
              <Form.Group>
                <Form.Label>Select users to add</Form.Label>
                <Form.Control as="select" multiple value={selectedToAdd.map(String)} onChange={e => {
                  const select = e.target as unknown as HTMLSelectElement;
                  const opts = Array.from(select.selectedOptions).map((o) => Number((o as HTMLOptionElement).value));
                  setSelectedToAdd(opts);
                }}>
                  {allUsers.filter(u => !members.some(m => m.id === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.username})</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button className="mt-2" onClick={handleAddMembers} disabled={adding || selectedToAdd.length === 0}>
                {adding ? <Spinner animation="border" size="sm" /> : 'Add to Group'}
              </Button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMembersModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

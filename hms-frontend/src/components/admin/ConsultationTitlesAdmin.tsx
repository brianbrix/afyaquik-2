import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationTitlesApi, ConsultationTitle, ConsultationTitleRequest } from '../../services/consultationTitlesApi';
import { Button, Form, InputGroup, ListGroup, Spinner, Card, Badge, Modal, Row, Col, Alert, TreeView } from 'react-bootstrap';
import Swal from 'sweetalert2';

export const ConsultationTitlesAdmin: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<ConsultationTitle | null>(null);
  const [formData, setFormData] = useState<ConsultationTitleRequest>({
    title: '',
    level: 1,
    sortOrder: 0,
    isCustom: false,
    parentId: undefined
  });

  const queryClient = useQueryClient();

  // Fetch all consultation titles
  const { data: titles = [], isLoading, error } = useQuery({
    queryKey: ['consultationTitles'],
    queryFn: consultationTitlesApi.getAll
  });

  // Fetch parent candidates
  const { data: parentCandidates = [] } = useQuery({
    queryKey: ['consultationTitleParentCandidates'],
    queryFn: consultationTitlesApi.getParentCandidates
  });

  // Create title mutation
  const createTitleMutation = useMutation({
    mutationFn: consultationTitlesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationTitles'] });
      setShowCreateModal(false);
      setFormData({
        title: '',
        level: 1,
        sortOrder: 0,
        isCustom: false,
        parentId: undefined
      });
      Swal.fire({ icon: 'success', title: 'Consultation title created successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to create consultation title' });
    }
  });

  // Update title mutation
  const updateTitleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConsultationTitleRequest }) => 
      consultationTitlesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationTitles'] });
      setShowEditModal(false);
      setSelectedTitle(null);
      Swal.fire({ icon: 'success', title: 'Consultation title updated successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to update consultation title' });
    }
  });

  // Delete title mutation
  const deleteTitleMutation = useMutation({
    mutationFn: consultationTitlesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultationTitles'] });
      Swal.fire({ icon: 'success', title: 'Consultation title deleted successfully', timer: 1500, showConfirmButton: false });
    },
    onError: (error: any) => {
      Swal.fire({ icon: 'error', title: 'Error', text: error?.message || 'Failed to delete consultation title' });
    }
  });

  const handleCreateTitle = () => {
    setFormData({
      title: '',
      level: 1,
      sortOrder: 0,
      isCustom: false,
      parentId: undefined
    });
    setShowCreateModal(true);
  };

  const handleEditTitle = (title: ConsultationTitle) => {
    setSelectedTitle(title);
    setFormData({
      title: title.title,
      level: title.level,
      sortOrder: title.sortOrder,
      isCustom: title.isCustom,
      parentId: title.parentId
    });
    setShowEditModal(true);
  };

  const handleDeleteTitle = (id: number, title: string) => {
    Swal.fire({
      title: 'Delete Consultation Title?',
      text: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTitleMutation.mutate(id);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showCreateModal) {
      createTitleMutation.mutate(formData);
    } else if (showEditModal && selectedTitle) {
      updateTitleMutation.mutate({ id: selectedTitle.id!, data: formData });
    }
  };

  const handleParentChange = (parentId: number | undefined) => {
    const parent = parentCandidates.find(p => p.id === parentId);
    const newLevel = parent ? parent.level + 1 : 1;
    setFormData({ ...formData, parentId, level: newLevel });
  };

  // Build hierarchical structure
  const buildHierarchy = (titles: ConsultationTitle[]): ConsultationTitle[] => {
    const titleMap = new Map<number, ConsultationTitle>();
    const rootTitles: ConsultationTitle[] = [];

    // Create map of all titles
    titles.forEach(title => {
      titleMap.set(title.id!, { ...title, children: [] });
    });

    // Build hierarchy
    titles.forEach(title => {
      const titleWithChildren = titleMap.get(title.id!)!;
      if (title.parentId) {
        const parent = titleMap.get(title.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(titleWithChildren);
        }
      } else {
        rootTitles.push(titleWithChildren);
      }
    });

    return rootTitles;
  };

  const renderHierarchy = (titles: ConsultationTitle[], level = 0) => {
    return titles.map(title => (
      <div key={title.id} style={{ marginLeft: `${level * 20}px` }}>
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Badge bg="secondary" className="me-2">L{title.level}</Badge>
            <span>{title.title}</span>
            {title.isCustom && <Badge bg="info" className="ms-2">Custom</Badge>}
          </div>
          <div className="d-flex gap-1">
            <Button 
              size="sm" 
              variant="outline-primary"
              onClick={() => handleEditTitle(title)}
              disabled={updateTitleMutation.isPending}
              title="Edit title"
            >
              <i className="bi bi-pencil"></i>
            </Button>
            <Button 
              size="sm" 
              variant="outline-danger"
              onClick={() => handleDeleteTitle(title.id!, title.title)}
              disabled={deleteTitleMutation.isPending}
              title="Delete title"
            >
              <i className="bi bi-trash"></i>
            </Button>
          </div>
        </ListGroup.Item>
        {title.children && title.children.length > 0 && renderHierarchy(title.children, level + 1)}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Consultation Titles</Alert.Heading>
        <p>Failed to load consultation titles. Please try again later.</p>
      </Alert>
    );
  }

  const hierarchicalTitles = buildHierarchy(titles);

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Consultation Titles Management</h5>
          <Button variant="primary" onClick={handleCreateTitle}>
            <i className="bi bi-plus-circle me-2"></i>
            Add Title
          </Button>
        </Card.Header>
        <Card.Body>
          <ListGroup>
            {hierarchicalTitles.length > 0 ? (
              renderHierarchy(hierarchicalTitles)
            ) : (
              <ListGroup.Item className="text-center text-muted">
                No consultation titles found. Click "Add Title" to create the first one.
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showCreateModal || showEditModal} onHide={() => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedTitle(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {showCreateModal ? 'Add Consultation Title' : 'Edit Consultation Title'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter consultation title"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Parent Category</Form.Label>
                  <Form.Select
                    value={formData.parentId || ''}
                    onChange={(e) => handleParentChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  >
                    <option value="">Root Level (Level 1)</option>
                    {parentCandidates.map(parent => (
                      <option key={parent.id} value={parent.id}>
                        {'  '.repeat(parent.level - 1)}L{parent.level}: {parent.title}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Current Level: {formData.level}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sort Order</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Custom title (can be entered by users)"
                    checked={formData.isCustom}
                    onChange={(e) => setFormData({ ...formData, isCustom: e.target.checked })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={createTitleMutation.isPending || updateTitleMutation.isPending || !formData.title.trim()}
          >
            {(createTitleMutation.isPending || updateTitleMutation.isPending) ? (
              <>
                <Spinner size="sm" className="me-2" />
                {showCreateModal ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              showCreateModal ? 'Create Title' : 'Update Title'
            )}
          </Button>
          <Button variant="secondary" onClick={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedTitle(null);
          }}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
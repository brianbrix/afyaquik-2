import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Table, Alert, Modal } from 'react-bootstrap';
import { diagnosticResultApi, diagnosticNoteApi, diagnosticFileAttachmentApi, diagnosticOrderApi } from '../../services/diagnosticsApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

interface DiagnosticResultsReadOnlyProps {
  queueItemId: number;
  onClose?: () => void;
}

export const DiagnosticResultsReadOnly: React.FC<DiagnosticResultsReadOnlyProps> = ({
  queueItemId,
  onClose
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [notes, setNotes] = useState<Record<number, any[]>>({});
  const [files, setFiles] = useState<Record<number, any[]>>({});
  const queryClient = useQueryClient();

  // Use React Query for data fetching
  const { data: diagnosticOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['diagnostic-orders', queueItemId],
    queryFn: () => diagnosticOrderApi.getByQueueItem(queueItemId),
    enabled: !!queueItemId,
  });

  const { data: results = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['diagnostic-results', queueItemId],
    queryFn: () => diagnosticResultApi.getAll({ queueItemId }),
    enabled: !!queueItemId,
  });

  const loading = ordersLoading || resultsLoading;

  // Process results to extract notes and files
  useEffect(() => {
    if (results.length > 0) {
      const notesMap: Record<number, any[]> = {};
      const filesMap: Record<number, any[]> = {};
      
      results.forEach(result => {
        const itemId = result.diagnosticItemId;
        
        // Add notes from itemNotesList
        if (result.itemNotesList && result.itemNotesList.length > 0) {
          if (!notesMap[itemId]) {
            notesMap[itemId] = [];
          }
          result.itemNotesList.forEach(note => {
            if (!notesMap[itemId].some(existingNote => existingNote.id === note.id)) {
              notesMap[itemId].push(note);
            }
          });
        }
        
        // Add files from itemFiles
        if (result.itemFiles && result.itemFiles.length > 0) {
          if (!filesMap[itemId]) {
            filesMap[itemId] = [];
          }
          result.itemFiles.forEach(file => {
            if (!filesMap[itemId].some(existingFile => existingFile.id === file.id)) {
              filesMap[itemId].push(file);
            }
          });
        }
      });
      
      setNotes(notesMap);
      setFiles(filesMap);
    }
  }, [results]);

  const getResultsForItem = (itemId: number) => {
    const itemResults = results.filter(result => result.diagnosticItemId === itemId);
    
    // Group by fieldName to get the most recent result for each field
    const fieldGroups: Record<string, any[]> = {};
    itemResults.forEach(result => {
      const fieldName = result.fieldName || 'unknown';
      if (!fieldGroups[fieldName]) {
        fieldGroups[fieldName] = [];
      }
      fieldGroups[fieldName].push(result);
    });
    
    // For each field, get the most recent result (by performedAt date)
    const latestResults: any[] = [];
    Object.values(fieldGroups).forEach(fieldResults => {
      if (fieldResults.length > 0) {
        // Sort by performedAt date (most recent first)
        const sortedResults = fieldResults.sort((a, b) => 
          new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
        );
        latestResults.push(sortedResults[0]);
      }
    });
    
    return latestResults;
  };

  const getNotesForItem = (itemId: number) => {
    const itemNotes = notes[itemId] || [];
    // Remove duplicates based on note ID
    const uniqueNotes = itemNotes.filter((note, index, self) => 
      index === self.findIndex(n => n.id === note.id)
    );
    return uniqueNotes;
  };

  const getFilesForItem = (itemId: number) => {
    const itemFiles = files[itemId] || [];
    // Remove duplicates based on file ID
    const uniqueFiles = itemFiles.filter((file, index, self) => 
      index === self.findIndex(f => f.id === file.id)
    );
    return uniqueFiles;
  };

  const hasMultipleResultsForItem = (itemId: number) => {
    const itemResults = results.filter(result => result.diagnosticItemId === itemId);
    const fieldGroups: Record<string, any[]> = {};
    itemResults.forEach(result => {
      const fieldName = result.fieldName || 'unknown';
      if (!fieldGroups[fieldName]) {
        fieldGroups[fieldName] = [];
      }
      fieldGroups[fieldName].push(result);
    });
    
    // Check if any field has multiple results
    return Object.values(fieldGroups).some(fieldResults => fieldResults.length > 1);
  };

  const handleViewNotes = (item: any) => {
    setSelectedItem(item);
    setShowNotesModal(true);
  };

  const handleViewFiles = (item: any) => {
    setSelectedItem(item);
    setShowFilesModal(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading diagnostic results...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Diagnostic Results - Read Only</h5>
        {onClose && (
          <Button variant="outline-secondary" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {diagnosticOrders.length === 0 ? (
        <Alert variant="info">No diagnostic orders found for this queue item.</Alert>
      ) : (
        diagnosticOrders.map((order, orderIndex) => (
          <div key={order.id} className="mb-4">
            <Card className="mb-3">
              <Card.Header>
                <h6 className="mb-0">Order #{order.id}</h6>
                <small className="text-muted">
                  Status: {order.status} • Ordered: {formatDateTime(order.orderedAt)}
                </small>
              </Card.Header>
            </Card>
            
            {order.diagnosticItems && order.diagnosticItems.length > 0 ? (
              order.diagnosticItems.map((item: any, itemIndex: number) => {
        const itemResults = getResultsForItem(item.id);
        const itemNotes = getNotesForItem(item.id);
        const itemFiles = getFilesForItem(item.id);

        // Get the status to display - check if there are results for this item
        const getDisplayStatus = () => {
          if (itemResults.length > 0) {
            // If there are results, use the most recent result status
            const latestResult = itemResults.sort((a: any, b: any) => 
              new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
            )[0];
            return latestResult.status;
          }
          
          // If no results, use the item status
          return item.status;
        };
        
        const displayStatus = getDisplayStatus();

        return (
          <Card key={item.id} className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">{item.testName}</h6>
                  <small className="text-muted">
                    {item.testType} • {item.department}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <Badge bg={displayStatus === 'COMPLETED' ? 'success' : displayStatus === 'VALIDATED' ? 'primary' : 'warning'}>
                    {displayStatus}
                  </Badge>
                  {itemNotes.length > 0 && (
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewNotes(item)}
                    >
                      <i className="bi bi-sticky me-1"></i>
                      Notes ({itemNotes.length})
                    </Button>
                  )}
                  {itemFiles.length > 0 && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewFiles(item)}
                    >
                      <i className="bi bi-paperclip me-1"></i>
                      Files ({itemFiles.length})
                    </Button>
                  )}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {hasMultipleResultsForItem(item.id) && (
                <Alert variant="warning" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Multiple Results Detected:</strong> This test has multiple result entries. Showing the most recent results only.
                </Alert>
              )}
              {itemResults.length > 0 ? (
                <div>
                  <h6 className="mb-3">Test Results</h6>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Field</th>
                        <th>Value</th>
                        <th>Reference Range</th>
                        <th>Status</th>
                        <th>Performed By</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemResults.map((result, resultIndex) => (
                        <tr key={resultIndex}>
                          <td>{result.fieldLabel || result.fieldName}</td>
                          <td>
                            <strong>{result.resultValue}</strong>
                            {result.resultText && (
                              <div className="text-muted small">{result.resultText}</div>
                            )}
                          </td>
                          <td>{result.interpretation || '—'}</td>
                          <td>
                            <Badge bg={result.status === 'VALIDATED' ? 'success' : result.status === 'COMPLETED' ? 'primary' : 'warning'}>
                              {result.status}
                            </Badge>
                          </td>
                          <td>{result.performedByName}</td>
                          <td>{formatDateTime(result.performedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  No results available for this test.
                </Alert>
              )}
            </Card.Body>
                  </Card>
                );
              })
            ) : (
              <Alert variant="info">No diagnostic items found in this order.</Alert>
            )}
          </div>
        ))
      )}

      {/* Notes Modal */}
      <Modal show={showNotesModal} onHide={() => setShowNotesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Notes for {selectedItem?.testName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && getNotesForItem(selectedItem.id).length > 0 ? (
            <div className="list-group">
              {getNotesForItem(selectedItem.id).map((note) => (
                <div key={note.id} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <p className="mb-1">{note.noteText}</p>
                      <small className="text-muted">
                        Added by {note.addedByName} on {formatDateTime(note.addedAt)}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted text-center py-3">
              No notes available for this test.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Files Modal */}
      <Modal show={showFilesModal} onHide={() => setShowFilesModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Files for {selectedItem?.testName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && getFilesForItem(selectedItem.id).length > 0 ? (
            <div className="row">
              {getFilesForItem(selectedItem.id).map((file) => (
                <div key={file.id} className="col-md-6 mb-3">
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-truncate" title={file.originalFilename}>
                            {file.originalFilename}
                          </h6>
                          <small className="text-muted">
                            {formatFileSize(file.fileSize)} • {file.contentType}
                          </small>
                          <br />
                          <small className="text-muted">
                            Uploaded by {file.uploadedByName} on {formatDateTime(file.uploadedAt)}
                          </small>
                        </div>
                      </div>
                      
                      {/* File Preview */}
                      <div className="mt-2">
                        {file.contentType.startsWith('image/') ? (
                          <img 
                            src={file.fileUrl} 
                            alt={file.originalFilename}
                            className="img-thumbnail"
                            style={{ maxWidth: '100%', maxHeight: '150px' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center py-3 bg-light rounded">
                            <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
                            <br />
                            <small className="text-muted">{file.contentType}</small>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          href={file.fileUrl} 
                          target="_blank"
                        >
                          <i className="bi bi-download me-1"></i>
                          Download
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted text-center py-3">
              No files available for this test.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

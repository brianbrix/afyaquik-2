import React, { useState, useEffect } from 'react';
import { consultationTitlesApi, ConsultationTitle } from '../../services/consultationTitlesApi';
import { testCatalogApi, diagnosticOrderApi } from '../../services/diagnosticsApi';
import { medicationApi, queuePrescriptionApi, prescriptionApi, type Medication } from '../../services/pharmacyApi';
import RichTextEditor from '../shared/RichTextEditor';
import { Button, Form, Row, Col, InputGroup, Modal, Card, Badge, Table, Alert, Spinner } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

export interface ConsultationItem {
  id: number;
  title: string;
  details: string;
  isCustom: boolean;
  consultationTitleId?: number;
  consultationTitleName?: string;
  consultationTitleLevel?: number;
  sortOrder?: number;
}

interface ConsultationActionsSectionProps {
  initialItems?: ConsultationItem[];
  onChange?: (items: ConsultationItem[]) => void;
  onSubmit?: (items: ConsultationItem[]) => void | Promise<void>;
  loading?: boolean;
  queueItemId?: number;
  patientId?: number;
  isReadonly?: boolean;
}

export const ConsultationActionsSection: React.FC<ConsultationActionsSectionProps> = ({ 
  initialItems = [], 
  onChange, 
  onSubmit, 
  loading,
  queueItemId,
  patientId,
  isReadonly = false
}) => {
  const [items, setItems] = useState<ConsultationItem[]>(initialItems);
  const [customTitle, setCustomTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync items with initialItems when they change (e.g., when data is loaded from DB)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);
  
  // Hierarchical title selection state
  const [selectedLevel1, setSelectedLevel1] = useState<ConsultationTitle | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<ConsultationTitle | null>(null);
  const [selectedLevel3, setSelectedLevel3] = useState<ConsultationTitle | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Diagnostic order state
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [selectedTests, setSelectedTests] = useState<number[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [urgency, setUrgency] = useState<'ROUTINE' | 'STAT' | 'EMERGENCY'>('ROUTINE');
  
  // Edit order state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editClinicalNotes, setEditClinicalNotes] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editUrgency, setEditUrgency] = useState<'ROUTINE' | 'STAT' | 'EMERGENCY'>('ROUTINE');
  
  // Prescription state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [currentPrescription, setCurrentPrescription] = useState<Partial<any>>({});
  const [stockLevels, setStockLevels] = useState<Record<number, number>>({});
  
  const { user } = useAuth();

  // Fetch consultation titles by level
  const { data: level1Titles = [], isLoading: loadingLevel1, error: level1Error } = useQuery({
    queryKey: ['consultationTitles', 'level', 1],
    queryFn: () => consultationTitlesApi.getByLevel(1)
  });

  // Debug logging
  React.useEffect(() => {
    if (level1Titles.length > 0) {
      console.log('Level 1 titles loaded:', level1Titles);
    }
    if (level1Error) {
      console.error('Error loading level 1 titles:', level1Error);
    }
  }, [level1Titles, level1Error]);

  const { data: level2Titles = [], isLoading: loadingLevel2, error: level2Error } = useQuery({
    queryKey: ['consultationTitles', 'level', 2, selectedLevel1?.id],
    queryFn: () => consultationTitlesApi.getChildren(selectedLevel1!.id!),
    enabled: !!selectedLevel1
  });

  const { data: level3Titles = [], isLoading: loadingLevel3, error: level3Error } = useQuery({
    queryKey: ['consultationTitles', 'level', 3, selectedLevel2?.id],
    queryFn: () => consultationTitlesApi.getChildren(selectedLevel2!.id!),
    enabled: !!selectedLevel2
  });

  // Debug logging for level 2 and 3
  React.useEffect(() => {
    if (level2Titles.length > 0) {
      console.log('Level 2 titles loaded:', level2Titles);
    }
    if (level2Error) {
      console.error('Error loading level 2 titles:', level2Error);
    }
  }, [level2Titles, level2Error]);

  React.useEffect(() => {
    if (level3Titles.length > 0) {
      console.log('Level 3 titles loaded:', level3Titles);
    }
    if (level3Error) {
      console.error('Error loading level 3 titles:', level3Error);
    }
  }, [level3Titles, level3Error]);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Hierarchical selection handlers
  const handleLevel1Select = (title: ConsultationTitle) => {
    setSelectedLevel1(title);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
    setCurrentLevel(2);
    setShowCustomInput(false);
  };

  const handleLevel2Select = (title: ConsultationTitle) => {
    setSelectedLevel2(title);
    setSelectedLevel3(null);
    setCurrentLevel(3);
    setShowCustomInput(false);
  };

  const handleLevel3Select = (title: ConsultationTitle) => {
    setSelectedLevel3(title);
    setShowCustomInput(true);
  };

  const findDuplicateItem = (title: string) => {
    return items.find(item => item.title === title);
  };

  const scrollToItem = (itemId: number) => {
    // Find the item element and scroll to it
    const itemElement = document.querySelector(`[data-consultation-item-id="${itemId}"]`);
    if (itemElement) {
      itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a temporary highlight effect
      itemElement.classList.add('border-warning', 'bg-warning-subtle');
      setTimeout(() => {
        itemElement.classList.remove('border-warning', 'bg-warning-subtle');
      }, 3000);
    }
  };

  const handleCustomTitleSubmit = () => {
    if (!customTitle.trim()) return;
    
    const isNote = shouldShowRichText();
    const displayPath = buildDisplayPath();
    const fullTitle = isNote ? displayPath : buildFullTitle();
    
    // Check for duplicate title
    const existingItem = findDuplicateItem(fullTitle);
    if (existingItem) {
      Swal.fire({
        icon: 'info',
        title: 'Item Already Exists',
        text: `A consultation item with the title "${fullTitle}" already exists. Navigating to the existing item.`,
        confirmButtonText: 'Go to Item',
        showCancelButton: true,
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          scrollToItem(existingItem.id);
        }
      });
      return;
    }
    
    const newItem: ConsultationItem = {
      id: Date.now(),
      title: fullTitle,
      details: isNote ? customTitle : '',
      isCustom: true,
      consultationTitleId: selectedLevel3?.id || selectedLevel2?.id || selectedLevel1?.id,
      consultationTitleName: selectedLevel3?.title || selectedLevel2?.title || selectedLevel1?.title,
      consultationTitleLevel: selectedLevel3?.level || selectedLevel2?.level || selectedLevel1?.level,
      sortOrder: 0
    };
    
    // Update sort orders of existing items and add new item at the top
    const updatedItems = items.map((item, index) => ({
      ...item,
      sortOrder: index + 1
    }));
    const finalItems = [newItem, ...updatedItems];
    setItems(finalItems);
    setCustomTitle('');
    resetSelection();
    onChange?.(finalItems);
  };

  const buildFullTitle = () => {
    const parts = [];
    if (selectedLevel1) parts.push(selectedLevel1.title);
    if (selectedLevel2) parts.push(selectedLevel2.title);
    if (selectedLevel3) parts.push(selectedLevel3.title);
    if (customTitle.trim()) parts.push(customTitle.trim());
    return parts.join(' > ');
  };

  const buildDisplayPath = () => {
    const parts = [];
    if (selectedLevel1) parts.push(selectedLevel1.title);
    if (selectedLevel2) parts.push(selectedLevel2.title);
    if (selectedLevel3) parts.push(selectedLevel3.title);
    return parts.join(' > ');
  };

  const resetSelection = () => {
    setSelectedLevel1(null);
    setSelectedLevel2(null);
    setSelectedLevel3(null);
    setCurrentLevel(1);
    setShowCustomInput(false);
    setCustomTitle('');
  };

  const canAddCustom = () => {
    if (currentLevel === 1) return true;
    if (currentLevel === 2 && selectedLevel1) return true;
    if (currentLevel === 3 && selectedLevel2) return true;
    return false;
  };

  const shouldShowRichText = () => {
    // Show RichText if we have a selected level but no children available
    let shouldShow = false;
    if (selectedLevel1 && level2Titles.length === 0 && !selectedLevel2) shouldShow = true;
    if (selectedLevel2 && level3Titles.length === 0 && !selectedLevel3) shouldShow = true;
    if (selectedLevel3) shouldShow = true;
    
    // Don't show if there's already a duplicate title
    if (shouldShow) {
      const displayPath = buildDisplayPath();
      const existingItem = findDuplicateItem(displayPath);
      if (existingItem) {
        return false; // Don't show RichText if duplicate exists
      }
    }
    
    return shouldShow;
  };

  const shouldShowCustomTitleOption = () => {
    // This function is no longer used - we go directly to RichText
    return false;
  };

  // Debug logging
  React.useEffect(() => {
    console.log('Debug - shouldShowRichText:', {
      selectedLevel1: selectedLevel1?.title,
      selectedLevel2: selectedLevel2?.title,
      selectedLevel3: selectedLevel3?.title,
      level2Titles: level2Titles.length,
      level3Titles: level3Titles.length,
      shouldShow: shouldShowRichText()
    });
  }, [selectedLevel1, selectedLevel2, selectedLevel3, level2Titles.length, level3Titles.length]);

  const shouldShowCustomTitleInput = () => {
    // Don't show if we should show RichText (no children case)
    if (shouldShowRichText()) return false;
    
    // Show custom title input when user explicitly wants to add custom and we can add custom
    return showCustomInput && canAddCustom();
  };


  // Fetch available diagnostic tests
  const { data: availableTests = [], isLoading: testsLoading } = useQuery({
    queryKey: ['diagnostic-tests'],
    queryFn: () => testCatalogApi.getAll({ active: true }),
  });

  // Fetch existing diagnostic orders for this queue item
  const { data: existingOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['diagnostic-orders', queueItemId],
    queryFn: () => diagnosticOrderApi.getByQueueItem(queueItemId!),
    enabled: !!queueItemId,
  });

  // Fetch medications for prescription
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => medicationApi.getAll(),
  });

  // Fetch existing prescriptions for this queue item
  const { data: existingPrescriptions = [], isLoading: prescriptionsLoading, refetch: refetchPrescriptions } = useQuery({
    queryKey: ['queue-prescriptions', queueItemId],
    queryFn: () => queuePrescriptionApi.getByQueueItem(queueItemId!),
    enabled: !!queueItemId,
  });

  const handleAddItem = (title: string, isCustom = false) => {
    if (!title.trim()) return;
    
    // Check for duplicate titles
    const trimmedTitle = title.trim();
    const existingTitles = items.map(item => item.title.toLowerCase());
    
    if (existingTitles.includes(trimmedTitle.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate Title',
        text: `A consultation item with the title "${trimmedTitle}" already exists. Please choose a different title.`,
        confirmButtonText: 'OK'
      });
      return;
    }
    
    const newItem: ConsultationItem = {
      id: Date.now() + Math.random(),
      title: trimmedTitle,
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

  const handleCreateDiagnosticOrder = async () => {
    if (selectedTests.length === 0) {
      Swal.fire('Error', 'Please select at least one test', 'error');
      return;
    }

    try {
      // Create diagnostic order
      const orderData = {
        patientId: patientId!,
        queueItemId: queueItemId!,
        clinicalNotes: clinicalNotes + (instructions ? `\n\nInstructions: ${instructions}` : ''),
        urgency,
        diagnosticItems: selectedTests.map((testId, index) => {
          const test = availableTests.find(t => t.id === testId);
          return {
            id: Date.now() + index, // Temporary ID for new items
            testCatalogId: testId,
            testCode: test?.testCode || '',
            testName: test?.testName || '',
            testType: test?.testType || '',
            department: test?.department || '',
            status: 'PENDING',
            cost: test?.cost || 0
          };
        })
      };

      await diagnosticOrderApi.create(orderData);
      
      // Refetch orders to show the new one
      refetchOrders();
      
      Swal.fire('Success', 'Diagnostic order created successfully', 'success');
      setShowDiagnosticModal(false);
      setSelectedTests([]);
      setClinicalNotes('');
      setInstructions('');
      setUrgency('ROUTINE');
    } catch (error) {
      console.error('Failed to create diagnostic order:', error);
      Swal.fire('Error', 'Failed to create diagnostic order', 'error');
    }
  };

  const handleTestSelection = (testId: number, checked: boolean) => {
    if (checked) {
      setSelectedTests(prev => [...prev, testId]);
    } else {
      setSelectedTests(prev => prev.filter(id => id !== testId));
    }
  };

  const handleEditOrder = (order: any) => {
    if (order.status !== 'ORDERED') {
      Swal.fire('Error', 'Only orders with ORDERED status can be edited', 'error');
      return;
    }
    setSelectedOrder(order);
    setEditClinicalNotes(order.clinicalNotes || '');
    setEditInstructions('');
    setEditUrgency(order.urgency || 'ROUTINE');
    setShowEditModal(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      const updatedOrder = {
        ...selectedOrder,
        clinicalNotes: editClinicalNotes + (editInstructions ? `\n\nInstructions: ${editInstructions}` : ''),
        urgency: editUrgency
      };

      await diagnosticOrderApi.update(selectedOrder.id, updatedOrder);
      refetchOrders();
      setShowEditModal(false);
      setSelectedOrder(null);
      Swal.fire('Success', 'Order updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update order:', error);
      Swal.fire('Error', 'Failed to update order', 'error');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this diagnostic order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      try {
        await diagnosticOrderApi.updateStatus(orderId, 'CANCELLED');
        refetchOrders();
        Swal.fire('Success', 'Order cancelled successfully', 'success');
      } catch (error) {
        console.error('Failed to cancel order:', error);
        Swal.fire('Error', 'Failed to cancel order', 'error');
      }
    }
  };

  // Prescription functions
  const handleAddPrescription = () => {
    setCurrentPrescription({
      medicationId: undefined,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1
    });
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async () => {
    if (!currentPrescription.medicationId || !patientId || !user?.id) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      const prescriptionRequest = {
        patientId: patientId,
        prescribedById: user.id,
        notes: currentPrescription.instructions || '',
        items: [{
          medicationId: currentPrescription.medicationId,
          quantityPrescribed: currentPrescription.quantity || 1,
          dosageInstructions: currentPrescription.dosage || '',
          frequency: currentPrescription.frequency || '',
          durationDays: currentPrescription.duration ? parseInt(currentPrescription.duration) : undefined,
          unitPrice: 0, // Will be set by backend from medication price
          notes: currentPrescription.instructions || ''
        }]
      };

      await queuePrescriptionApi.createForQueueItem(queueItemId!, prescriptionRequest);
      await refetchPrescriptions();
      setShowPrescriptionModal(false);
      setCurrentPrescription({});
      Swal.fire('Success', 'Prescription created successfully', 'success');
    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to create prescription';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPrescription = (prescription: any) => {
    setCurrentPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleUpdatePrescription = async () => {
    if (!currentPrescription.id || !currentPrescription.medicationId) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      
      const updateRequest = {
        prescriptionNumber: currentPrescription.prescriptionNumber || `RX-${Date.now()}`,
        patientId: patientId!,
        prescribedById: user?.id || 1,
        prescriptionDate: currentPrescription.prescribedAt,
        notes: currentPrescription.instructions || '',
        items: [{
          medicationId: currentPrescription.medicationId,
          quantityPrescribed: currentPrescription.quantity || 1,
          dosageInstructions: currentPrescription.dosage || '',
          frequency: currentPrescription.frequency || '',
          durationDays: currentPrescription.duration ? parseInt(currentPrescription.duration) : undefined,
          unitPrice: currentPrescription.unitPrice || undefined,
          notes: currentPrescription.instructions || ''
        }]
      };

      await prescriptionApi.update(currentPrescription.id, updateRequest);
      await refetchPrescriptions();
      setShowPrescriptionModal(false);
      setCurrentPrescription({});
      Swal.fire('Success', 'Prescription updated successfully', 'success');
    } catch (error: any) {
      console.error('Failed to update prescription:', error);
      
      // Extract error message from backend response
      let errorMessage = 'Failed to update prescription';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePrescription = async (prescriptionId: number) => {
    const result = await Swal.fire({
      title: 'Remove Prescription?',
      text: 'Are you sure you want to remove this prescription?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        await prescriptionApi.delete(prescriptionId);
        await refetchPrescriptions();
        Swal.fire('Success', 'Prescription removed successfully', 'success');
      } catch (error: any) {
        console.error('Failed to remove prescription:', error);
        
        // Extract error message from backend response
        let errorMessage = 'Failed to remove prescription';
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReplacePrescription = async (prescription: any) => {
    const isDispensed = prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED';
    
    const result = await Swal.fire({
      title: 'Replace Prescription',
      html: `
        <div>
          <p>Are you sure you want to replace prescription <strong>${prescription.prescriptionNumber}</strong>?</p>
          ${isDispensed ? `
            <div class="alert alert-warning">
              <strong>Warning:</strong> This prescription has been dispensed. 
              Replacing it will:
              <ul class="mb-0 mt-2">
                <li>Create a new prescription</li>
                <li>Mark the current one as replaced</li>
                <li><strong>Mark billing items as VOIDED (acts like a discount)</strong></li>
                <li>Bill items will remain visible but with negative amounts</li>
              </ul>
            </div>
          ` : `
            <p>This will create a new prescription and mark the current one as replaced.</p>
          `}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isDispensed ? 'Yes, replace and reverse billing!' : 'Yes, replace it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        
        // Create a new prescription with the same details
        // Extract the first item from the prescription items array
        const originalItem = prescription.items && prescription.items.length > 0 ? prescription.items[0] : null;
        
        if (!originalItem) {
          throw new Error('No prescription items found to replace');
        }

        const replacementRequest = {
          patientId: patientId!,
          prescribedById: user?.id || 1,
          notes: `Replacement for prescription ${prescription.prescriptionNumber}. Original: ${originalItem.dosageInstructions || 'No instructions'}`,
          items: [{
            medicationId: originalItem.medicationId,
            quantityPrescribed: originalItem.quantityPrescribed,
            dosageInstructions: originalItem.dosageInstructions,
            frequency: originalItem.frequency,
            durationDays: originalItem.durationDays,
            unitPrice: originalItem.unitPrice || undefined,
            notes: originalItem.notes
          }]
        };

        // Create the replacement prescription
        console.log('Creating replacement prescription...', replacementRequest);
        const replacementPrescription = await queuePrescriptionApi.createForQueueItem(queueItemId!, replacementRequest);
        console.log('Replacement prescription created:', replacementPrescription);
        
        // Mark the original prescription as replaced (this will handle billing reversal if dispensed)
        if (!user?.id) {
          throw new Error('User ID not available. Please refresh the page and try again.');
        }
        console.log('Marking original prescription as replaced...', prescription.id, replacementPrescription.id);
        await prescriptionApi.replace(prescription.id, replacementPrescription.id, user.id, 
          isDispensed ? 'Prescription replaced by doctor - billing reversed' : 'Prescription replaced by doctor');
        console.log('Original prescription marked as replaced');
        
        // Refetch prescriptions to get updated data
        await refetchPrescriptions();
        
        Swal.fire({
          title: 'Success', 
          text: isDispensed 
            ? 'Prescription replaced successfully. Billing items have been marked as VOIDED and will act like discounts.' 
            : 'Prescription replaced successfully',
          icon: 'success'
        });
      } catch (error: any) {
        console.error('Failed to replace prescription:', error);
        
        // Extract error message from backend response
        let errorMessage = 'Failed to replace prescription';
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((err: any) => err.message || err).join(', ');
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="mb-2">
      <div className="fw-semibold mb-2">Consultation Actions</div>
      {/* Hierarchical Consultation Title Selection */}
      <Card className="mb-3">
        <Card.Header>
          <h6 className="mb-0">Add Consultation Title</h6>
        </Card.Header>
        <Card.Body>
          {/* Level 1 Selection */}
          {currentLevel >= 1 && (
            <div className="mb-3">
              {level1Error ? (
                <Alert variant="danger" className="py-2">
                  <small>Error loading categories: {level1Error.message}</small>
                </Alert>
              ) : loadingLevel1 ? (
                <div className="text-center py-2">
                  <Spinner size="sm" className="me-2" />
                  Loading categories...
                </div>
              ) : level1Titles.length === 0 ? (
                <Alert variant="warning" className="py-2">
                  <small>No consultation categories found. Please contact admin to set up consultation titles.</small>
                </Alert>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {level1Titles.map((title: ConsultationTitle) => (
                    <Button
                      key={title.id}
                      variant={selectedLevel1?.id === title.id ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => handleLevel1Select(title)}
                    >
                      {title.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level 2 Selection */}
          {currentLevel >= 2 && selectedLevel1 && (
            <div className="mb-3">
              {level2Error ? (
                <Alert variant="danger" className="py-2">
                  <small>Error loading subcategories: {level2Error.message}</small>
                </Alert>
              ) : loadingLevel2 ? (
                <div className="text-center py-2">
                  <Spinner size="sm" className="me-2" />
                  Loading subcategories...
                </div>
              ) : level2Titles.length === 0 ? (
                <div className="text-center py-3">
                  <div className="text-muted mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    No subcategories found for "{selectedLevel1.title}". You can add a note below.
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {level2Titles.map((title: ConsultationTitle) => (
                    <Button
                      key={title.id}
                      variant={selectedLevel2?.id === title.id ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => handleLevel2Select(title)}
                    >
                      {title.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level 3 Selection */}
          {currentLevel >= 3 && selectedLevel2 && (
            <div className="mb-3">
              {level3Error ? (
                <Alert variant="danger" className="py-2">
                  <small>Error loading specific areas: {level3Error.message}</small>
                </Alert>
              ) : loadingLevel3 ? (
                <div className="text-center py-2">
                  <Spinner size="sm" className="me-2" />
                  Loading specific areas...
                </div>
              ) : level3Titles.length === 0 ? (
                <div className="text-center py-3">
                  <div className="text-muted mb-3">
                    <i className="bi bi-info-circle me-2"></i>
                    No specific areas found for "{selectedLevel2.title}". You can add a note below.
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {level3Titles.map((title: ConsultationTitle) => (
                    <Button
                      key={title.id}
                      variant={selectedLevel3?.id === title.id ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => handleLevel3Select(title)}
                    >
                      {title.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Duplicate Title Warning - Show when RichText would show but duplicate exists */}
          {(() => {
            // Check if we would show RichText but there's a duplicate
            let wouldShowRichText = false;
            if (selectedLevel1 && level2Titles.length === 0 && !selectedLevel2) wouldShowRichText = true;
            if (selectedLevel2 && level3Titles.length === 0 && !selectedLevel3) wouldShowRichText = true;
            if (selectedLevel3) wouldShowRichText = true;
            
            if (wouldShowRichText) {
              const displayPath = buildDisplayPath();
              const existingItem = findDuplicateItem(displayPath);
              if (existingItem) {
                return (
                  <div className="mb-3">
                    <div className="border rounded p-3 bg-warning-subtle border-warning">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                        <strong className="text-warning">Item Already Exists</strong>
                      </div>
                      <div className="mb-2">
                        <strong>Selected Path:</strong> {displayPath}
                      </div>
                      <div className="text-muted small mb-3">
                        A consultation item with this title already exists. You can edit the existing item or select a different path.
                      </div>
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => scrollToItem(existingItem.id)}
                      >
                        <i className="bi bi-arrow-right me-1"></i>
                        Go to Existing Item
                      </Button>
                    </div>
                  </div>
                );
              }
            }
            return null;
          })()}

          {/* RichText Field - Show directly when no children available */}
          {shouldShowRichText() && (
            <div className="mb-3">
              <div className="border rounded p-3 bg-light">
                <div className="mb-3">
                  <strong>Selected Path:</strong> {buildDisplayPath()}
                </div>
                <Form.Label>Add Consultation Note</Form.Label>
                <RichTextEditor
                  theme="snow"
                  value={customTitle}
                  onChange={setCustomTitle}
                  placeholder="Enter your consultation notes here..."
                />
                <div className="mt-2 d-flex justify-content-end">
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={handleCustomTitleSubmit}
                    disabled={isReadonly || !customTitle.trim()}
                  >
                    <i className="bi bi-plus me-1"></i>
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Custom Title Input - Only show when there are children but user wants to add custom */}
          {shouldShowCustomTitleInput() && (
            <div className="mb-3">
              <div className="border rounded p-3 bg-light">
                <div className="mb-3">
                  <strong>Selected Path:</strong> {buildDisplayPath()}
                </div>
                <Form.Label>Add Custom Title</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Enter custom title (will be a sibling to current selection)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                  <Button 
                    variant="primary" 
                    onClick={handleCustomTitleSubmit}
                    disabled={isReadonly || !customTitle.trim()}
                  >
                    Add Custom Title
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  This will create a new consultation title at the same level as the current selection.
                </Form.Text>
              </div>
            </div>
          )}

          {/* Duplicate section removed */}

          {/* Navigation Buttons */}
          <div className="d-flex gap-2">
            {currentLevel > 1 && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => {
                  if (currentLevel === 2) {
                    setSelectedLevel1(null);
                    setCurrentLevel(1);
                  } else if (currentLevel === 3) {
                    setSelectedLevel2(null);
                    setCurrentLevel(2);
                  }
                }}
              >
                <i className="bi bi-arrow-left me-1"></i>
                Back
              </Button>
            )}
            {canAddCustom() && !showCustomInput && (
              <Button 
                variant="outline-success" 
                size="sm"
                onClick={() => setShowCustomInput(true)}
              >
                <i className="bi bi-plus me-1"></i>
                Add Custom Title
              </Button>
            )}
            {(selectedLevel1 || selectedLevel2 || selectedLevel3) && (
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={resetSelection}
              >
                <i className="bi bi-x me-1"></i>
                Reset
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      {items.length === 0 && <div className="text-muted small mb-2">No consultation items added yet.</div>}
      {items.map((item, idx) => (
        <div key={item.id} data-consultation-item-id={item.id} className="border rounded p-2 mb-2 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-semibold">{item.title}</span>
            <Button size="sm" variant="outline-danger" onClick={() => handleRemoveItem(item.id)} disabled={isReadonly}>
              Remove
            </Button>
          </div>
          <RichTextEditor
            theme="snow"
            value={item.details}
            onChange={val => handleDetailsChange(item.id, val)}
            placeholder="Enter details..."
            style={{ background: 'white' }}
            readOnly={isReadonly}
          />
        </div>
      ))}
      
      {/* Diagnostic Orders Section */}
      <div className="border-top pt-3 mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold">Diagnostic Orders</span>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => setShowDiagnosticModal(true)}
            disabled={!queueItemId || !patientId}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Order Diagnostics
          </Button>
        </div>
        <div className="text-muted small mb-3">
          Order diagnostic tests for this patient during consultation
        </div>
        
        {/* Existing Diagnostic Orders */}
        {ordersLoading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm me-2"></div>
            Loading diagnostic orders...
          </div>
        ) : existingOrders.length > 0 ? (
          <div className="mb-3">
            {existingOrders.map((order) => (
              <Card key={order.id} className="mb-2">
                <Card.Body className="py-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-semibold">{order.orderNumber}</span>
                        <Badge bg={order.status === 'ORDERED' ? 'warning' : order.status === 'IN_PROGRESS' ? 'info' : order.status === 'COMPLETED' ? 'success' : 'secondary'}>
                          {order.status}
                        </Badge>
                        <Badge bg={order.urgency === 'EMERGENCY' ? 'danger' : order.urgency === 'STAT' ? 'warning' : 'secondary'}>
                          {order.urgency}
                        </Badge>
                      </div>
                      <div className="text-muted small mb-2">
                        {order.diagnosticItems?.length || 0} test(s) • Ordered by {order.orderedByName} • {new Date(order.orderedAt).toLocaleString()}
                      </div>
                      {order.clinicalNotes && (
                        <div className="text-muted small">
                          <strong>Notes:</strong> {order.clinicalNotes}
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      {order.status === 'ORDERED' && (
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={() => handleEditOrder(order)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                      )}
                      {order.status === 'ORDERED' && (
                        <Button 
                          size="sm" 
                          variant="outline-danger"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-muted small mb-3">
            No diagnostic orders created yet
          </div>
        )}
      </div>

      {/* Prescriptions Section */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Prescriptions</h6>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={handleAddPrescription}
            disabled={submitting}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Add Prescription
          </Button>
        </div>
        
        {existingPrescriptions.length > 0 ? (
          <Table responsive size="sm" hover>
            <thead>
              <tr>
                <th>Prescription #</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingPrescriptions.map((prescription) => (
                <tr key={prescription.id}>
                  <td>
                    <div className="fw-semibold">{prescription.prescriptionNumber}</div>
                    <small className="text-muted">
                      {new Date(prescription.prescriptionDate).toLocaleDateString()}
                    </small>
                  </td>
                  <td>
                    {prescription.items?.map((item: any) => item.medicationName).join(', ')}
                  </td>
                  <td>{prescription.items?.[0]?.dosageInstructions}</td>
                  <td>{prescription.items?.[0]?.frequency}</td>
                  <td>
                    {prescription.items?.[0]?.durationDays ? `${prescription.items[0].durationDays} days` : '—'}
                  </td>
                  <td>
                    <Badge bg={prescription.status === 'PENDING' ? 'warning' : 'success'}>
                      {prescription.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => handleEditPrescription(prescription)}
                        disabled={submitting || prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED'}
                        title={prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED' ? 'Cannot edit dispensed prescription' : 'Edit prescription'}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-warning"
                        onClick={() => handleReplacePrescription(prescription)}
                        disabled={submitting}
                        title="Replace prescription"
                      >
                        <i className="bi bi-arrow-repeat"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline-danger"
                        onClick={() => handleRemovePrescription(prescription.id)}
                        disabled={submitting || prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED'}
                        title={prescription.status === 'DISPENSED' || prescription.status === 'PARTIALLY_DISPENSED' ? 'Cannot delete dispensed prescription' : 'Delete prescription'}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-muted small mb-3">
            No prescriptions created yet
          </div>
        )}
      </div>
      
      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="primary"
          onClick={async () => {
            if (!onSubmit) return;
            setSubmitting(true);
            await onSubmit(items);
            setSubmitting(false);
          }}
          disabled={isReadonly || submitting || loading}
        >
          {submitting || loading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
      
      {/* Diagnostic Order Modal */}
      <Modal show={showDiagnosticModal} onHide={() => setShowDiagnosticModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Diagnostic Tests</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Urgency</Form.Label>
                  <Form.Select value={urgency} onChange={(e) => setUrgency(e.target.value as any)}>
                    <option value="ROUTINE">Routine</option>
                    <option value="STAT">Stat</option>
                    <option value="EMERGENCY">Emergency</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Selected Tests ({selectedTests.length})</Form.Label>
                  <div className="text-muted small">
                    {selectedTests.length > 0 ? `${selectedTests.length} test(s) selected` : 'No tests selected'}
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Clinical Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter clinical notes for the diagnostic order..."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Special instructions for the diagnostic tests..."
              />
            </Form.Group>
            
            <Form.Group>
              <Form.Label>Available Tests</Form.Label>
              {testsLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm me-2"></div>
                  Loading tests...
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableTests.map((test) => (
                    <Card key={test.id} className="mb-2">
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{test.testName}</div>
                            <div className="text-muted small">
                              {test.testType} • {test.department} • KSh {test.cost}
                            </div>
                          </div>
                          <Form.Check
                            type="checkbox"
                            checked={selectedTests.includes(test.id)}
                            onChange={(e) => handleTestSelection(test.id, e.target.checked)}
                          />
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                  {availableTests.length === 0 && (
                    <div className="text-center py-3 text-muted">
                      No diagnostic tests available
                    </div>
                  )}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDiagnosticModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateDiagnosticOrder}
            disabled={selectedTests.length === 0}
          >
            Create Diagnostic Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Order Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Diagnostic Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Form>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Order Number</Form.Label>
                    <Form.Control value={selectedOrder.orderNumber} disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Urgency</Form.Label>
                    <Form.Select value={editUrgency} onChange={(e) => setEditUrgency(e.target.value as any)}>
                      <option value="ROUTINE">Routine</option>
                      <option value="STAT">Stat</option>
                      <option value="EMERGENCY">Emergency</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Clinical Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editClinicalNotes}
                  onChange={(e) => setEditClinicalNotes(e.target.value)}
                  placeholder="Enter clinical notes..."
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Additional Instructions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  placeholder="Enter additional instructions..."
                />
              </Form.Group>
              
              <Alert variant="warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Note:</strong> You can only edit clinical notes, instructions, and urgency level. Test selection cannot be modified.
              </Alert>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateOrder}>
            Update Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Prescription Modal */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPrescription.id ? 'Edit Prescription' : 'Add Prescription'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Medication *</Form.Label>
                  <Form.Select
                    value={currentPrescription.medicationId || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      medicationId: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                  >
                    <option value="">Select medication</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>
                        {med.name} ({med.medicationCode || med.id})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quantity *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={currentPrescription.quantity || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      quantity: Number(e.target.value) 
                    }))}
                    placeholder="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dosage</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentPrescription.dosage || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      dosage: e.target.value 
                    }))}
                    placeholder="e.g., 500mg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Frequency</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentPrescription.frequency || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      frequency: e.target.value 
                    }))}
                    placeholder="e.g., Twice daily"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Duration (days)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={currentPrescription.duration || ''}
                    onChange={(e) => setCurrentPrescription(prev => ({ 
                      ...prev, 
                      duration: e.target.value 
                    }))}
                    placeholder="7"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={currentPrescription.instructions || ''}
                onChange={(e) => setCurrentPrescription(prev => ({ 
                  ...prev, 
                  instructions: e.target.value 
                }))}
                placeholder="Enter prescription instructions..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={currentPrescription.id ? handleUpdatePrescription : handleSavePrescription}
            disabled={submitting || !currentPrescription.medicationId}
          >
            {submitting ? 'Saving...' : (currentPrescription.id ? 'Update Prescription' : 'Create Prescription')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

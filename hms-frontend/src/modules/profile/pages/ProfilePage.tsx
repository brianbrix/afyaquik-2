import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Button, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { PageHeader } from '../../../components/shared/PageHeader';
import { PersonalInfoSection } from '../components/PersonalInfoSection';
import { ContactInfoSection } from '../components/ContactInfoSection';
import { WorkInfoSection } from '../components/WorkInfoSection';
import { EmergencyContactSection } from '../components/EmergencyContactSection';
import { PreferencesSection } from '../components/PreferencesSection';
import { profileApi, UserProfile } from '../../../services/profileApi';
import { useAuth } from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

export function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');

  // Fetch current user's profile
  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: profileApi.getMe,
    retry: 1
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (updatedProfile: Partial<UserProfile>) => profileApi.updateCurrent(updatedProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      Swal.fire('Success', 'Profile updated successfully', 'success');
    },
    onError: (error: any) => {
      Swal.fire('Error', 'Failed to update profile: ' + (error.message || 'Unknown error'), 'error');
    }
  });

  const handleUpdateProfile = (sectionData: Partial<UserProfile>) => {
    updateMutation.mutate(sectionData);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column gap-3">
        <PageHeader
          title="Profile"
          subtitle="Manage your personal and professional information"
        />
        <Alert variant="danger">
          <Alert.Heading>Error Loading Profile</Alert.Heading>
          <p>Unable to load your profile information. Please try again.</p>
          <Button variant="outline-danger" onClick={() => refetch()}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="d-flex flex-column gap-3">
        <PageHeader
          title="Profile"
          subtitle="Manage your personal and professional information"
        />
        <Alert variant="warning">
          <Alert.Heading>Profile Not Found</Alert.Heading>
          <p>Your profile could not be found. Please contact your administrator.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal and professional information"
      />

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || 'personal')}
            className="mb-4"
          >
            <Tab eventKey="personal" title="Personal Information">
              <PersonalInfoSection
                profile={profile}
                onUpdate={handleUpdateProfile}
                isUpdating={updateMutation.isPending}
              />
            </Tab>
            
            <Tab eventKey="contact" title="Contact Information">
              <ContactInfoSection
                profile={profile}
                onUpdate={handleUpdateProfile}
                isUpdating={updateMutation.isPending}
              />
            </Tab>
            
            <Tab eventKey="work" title="Work Information">
              <WorkInfoSection
                profile={profile}
                onUpdate={handleUpdateProfile}
                isUpdating={updateMutation.isPending}
              />
            </Tab>
            
            <Tab eventKey="emergency" title="Emergency Contact">
              <EmergencyContactSection
                profile={profile}
                onUpdate={handleUpdateProfile}
                isUpdating={updateMutation.isPending}
              />
            </Tab>
            
            <Tab eventKey="preferences" title="Preferences">
              <PreferencesSection
                profile={profile}
                onUpdate={handleUpdateProfile}
                isUpdating={updateMutation.isPending}
              />
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}

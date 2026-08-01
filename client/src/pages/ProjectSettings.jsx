import React, { useState, useEffect } from 'react';
import { PageHeader, Card, FormField, Button, Modal } from '../components/ui';
import { showToast } from '../components/ui/Toast';
import api from '../services/api';

const ProjectSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState({ name: '', description: '', timezone: 'UTC' });
  const [originalProject, setOriginalProject] = useState(null);

  // Danger Zone states
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/projects/current/settings');
      setProject(data);
      setOriginalProject(data);
    } catch (error) {
      showToast.error('Failed to load project settings');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = JSON.stringify(project) !== JSON.stringify(originalProject);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/projects/current/settings', project);
      setProject(data);
      setOriginalProject(data);
      showToast.success('Settings saved successfully');
    } catch (error) {
      showToast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await api.post('/projects/current/archive');
      showToast.success('Project archived');
      setShowArchiveModal(false);
      // Optional: Redirect or refresh
    } catch (error) {
      showToast.error('Failed to archive project');
    } finally {
      setArchiving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete('/projects/current', { data: { confirmName } });
      showToast.success('Project deleted successfully');
      setShowDeleteModal(false);
      // Optional: Refresh will recreate default project
      window.location.href = '/dashboard';
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-lg">Loading...</div>;
  }

  return (
    <div className="max-w-container-md mx-auto pb-10">
      <PageHeader
        title="Project Settings"
        subtitle="Manage your workspace settings and preferences."
        breadcrumbs={[
          { label: 'Project Settings' },
          { label: 'General' },
        ]}
      />

      <div className="space-y-xl">
        {/* General Settings */}
        <section>
          <h3 className="font-headline-sm text-headline-sm mb-md text-on-surface">General Information</h3>
          <Card className="p-xl space-y-lg">
            <FormField
              label="Project Name"
              type="text"
              value={project.name}
              onChange={(e) => setProject({ ...project, name: e.target.value })}
              placeholder="e.g. My Workspace"
            />
            
            <FormField
              label="Description"
              type="textarea"
              value={project.description}
              onChange={(e) => setProject({ ...project, description: e.target.value })}
              placeholder="A brief description of this project"
            />

            <FormField
              label="Timezone"
              type="select"
              value={project.timezone}
              onChange={(e) => setProject({ ...project, timezone: e.target.value })}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'London (GMT)' },
              ]}
            />

            <div className="pt-md flex justify-end">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!hasChanges || saving}
                loading={saving}
                icon="save"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </section>

        {/* Danger Zone */}
        <section>
          <h3 className="font-headline-sm text-headline-sm mb-md text-error flex items-center gap-sm">
            <span className="material-symbols-outlined">warning</span>
            Danger Zone
          </h3>
          <Card className="border-error bg-error-container/10">
            <div className="p-xl divide-y divide-outline-variant">
              <div className="flex items-center justify-between pb-lg">
                <div>
                  <h4 className="font-label-lg font-bold text-on-surface mb-xs">Archive Project</h4>
                  <p className="text-body-sm text-on-surface-variant">
                    Mark this project as archived. It will be hidden from default views but data is retained.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setShowArchiveModal(true)}>
                  Archive
                </Button>
              </div>

              <div className="flex items-center justify-between pt-lg">
                <div>
                  <h4 className="font-label-lg font-bold text-on-surface mb-xs">Delete Project</h4>
                  <p className="text-body-sm text-on-surface-variant max-w-lg">
                    Permanently delete this project and all associated assessments, responses, and history. 
                    This action cannot be undone.
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  className="!text-error !border-error hover:!bg-error-container"
                  onClick={() => { setConfirmName(''); setShowDeleteModal(true); }}
                >
                  Delete Project
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Archive Modal */}
      <Modal
        open={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        title="Archive Project"
        icon="archive"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowArchiveModal(false)}>Cancel</Button>
            <Button variant="primary" loading={archiving} onClick={handleArchive}>Confirm Archive</Button>
          </>
        }
      >
        <p className="text-body-md text-on-surface-variant">
          Are you sure you want to archive <strong>{project.name}</strong>? You can restore it later.
        </p>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        icon="delete_forever"
        iconBg="bg-error-container"
        iconColor="text-on-error-container"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              className="!bg-error hover:!bg-[#B3261E]" 
              loading={deleting} 
              disabled={confirmName !== project.name}
              onClick={handleDelete}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        <div className="space-y-md">
          <p className="text-body-md text-on-surface-variant">
            This action is permanent. To confirm deletion, please type the project name (<strong>{project.name}</strong>) below.
          </p>
          <FormField
            type="text"
            placeholder={project.name}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProjectSettings;

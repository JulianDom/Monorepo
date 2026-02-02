'use client';

import { useState } from 'react';
import { AdminList } from '@/features/admins/components/admin-list';
import { AdminForm } from '@/features/admins/components/admin-form';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmAction, getConfirmDialogTexts } from '@/hooks';
import {
  useAdmins,
  useCreateAdmin,
  useUpdateAdmin,
  useToggleAdminStatus,
  type Admin,
  type CreateAdminDTO,
  type UpdateAdminDTO,
} from '@/features/admins';

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // React Query hooks
  const { data: adminsData, isLoading } = useAdmins();
  const createAdmin = useCreateAdmin();
  const updateAdmin = useUpdateAdmin();
  const toggleStatus = useToggleAdminStatus();

  const admins = adminsData?.data ?? [];

  // Hook para manejar confirmación de toggle
  const {
    confirmState,
    requestToggle,
    cancel,
    confirm,
  } = useConfirmAction<Admin>({
    onToggle: (id, currentEnabled) => {
      toggleStatus.mutate({ id, enable: !currentEnabled });
    },
  });

  // Textos del diálogo según el estado
  const dialogTexts = getConfirmDialogTexts(
    confirmState.type,
    confirmState.item,
    'Administrador',
    (admin) => admin.fullName
  );

  const handleCreateAdmin = () => {
    setViewMode('create');
    setSelectedAdmin(null);
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setViewMode('edit');
  };

  const handleSaveAdmin = (adminData: CreateAdminDTO | UpdateAdminDTO) => {
    if (viewMode === 'create') {
      createAdmin.mutate(adminData as CreateAdminDTO, {
        onSuccess: () => {
          setViewMode('list');
          setSelectedAdmin(null);
        },
      });
    } else if (viewMode === 'edit' && selectedAdmin) {
      updateAdmin.mutate(
        { id: selectedAdmin.id, data: adminData as UpdateAdminDTO },
        {
          onSuccess: () => {
            setViewMode('list');
            setSelectedAdmin(null);
          },
        }
      );
    }
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setSelectedAdmin(null);
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <AdminForm
        mode={viewMode}
        initialData={selectedAdmin}
        onSave={handleSaveAdmin}
        onCancel={handleCancelForm}
        isLoading={createAdmin.isPending || updateAdmin.isPending}
      />
    );
  }

  return (
    <>
      <AdminList
        admins={admins}
        isLoading={isLoading}
        onCreateAdmin={handleCreateAdmin}
        onEditAdmin={handleEditAdmin}
        onToggleStatus={requestToggle}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={cancel}
        onConfirm={confirm}
        title={dialogTexts.title}
        description={dialogTexts.description}
        confirmText={dialogTexts.confirmText}
        variant={dialogTexts.isDestructive ? 'destructive' : 'default'}
      />
    </>
  );
}

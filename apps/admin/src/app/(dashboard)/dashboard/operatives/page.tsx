'use client';

import { useState } from 'react';
import { OperativeList } from '@/features/operatives/components/operative-list';
import { OperativeForm } from '@/features/operatives/components/operative-form';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmAction, getConfirmDialogTexts } from '@/hooks';
import {
  useOperatives,
  useCreateOperative,
  useUpdateOperative,
  useDeleteOperative,
  useToggleOperativeStatus,
  type PersistedOperativeUserProps,
  type CreateOperativeUserDTO,
  type UpdateOperativeUserDTO,
} from '@/features/operatives';

type ViewMode = 'list' | 'create' | 'edit';

export default function OperativesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOperative, setSelectedOperative] = useState<PersistedOperativeUserProps | null>(null);

  // React Query hooks
  const { data: operativesData, isLoading } = useOperatives();
  const createOperative = useCreateOperative();
  const updateOperative = useUpdateOperative();
  const deleteOperative = useDeleteOperative();
  const toggleStatus = useToggleOperativeStatus();

  const operatives = operativesData?.data ?? [];

  // Hook para manejar confirmación de toggle y delete
  const {
    confirmState,
    requestToggle,
    requestDelete,
    cancel,
    confirm,
  } = useConfirmAction<PersistedOperativeUserProps>({
    onToggle: (id, currentEnabled) => {
      toggleStatus.mutate({ id, enable: !currentEnabled });
    },
    onDelete: (id) => {
      deleteOperative.mutate(id);
    },
  });

  // Textos del diálogo según el tipo de acción
  const dialogTexts = getConfirmDialogTexts(
    confirmState.type,
    confirmState.item,
    'Usuario Operativo',
    (op) => op.fullName
  );

  const handleCreate = () => {
    setSelectedOperative(null);
    setViewMode('create');
  };

  const handleEdit = (operative: PersistedOperativeUserProps) => {
    setSelectedOperative(operative);
    setViewMode('edit');
  };

  const handleBack = () => {
    setSelectedOperative(null);
    setViewMode('list');
  };

  const handleSave = (data: CreateOperativeUserDTO | UpdateOperativeUserDTO) => {
    if (viewMode === 'create') {
      createOperative.mutate(data as CreateOperativeUserDTO, {
        onSuccess: () => {
          setViewMode('list');
          setSelectedOperative(null);
        },
      });
    } else if (viewMode === 'edit' && selectedOperative) {
      updateOperative.mutate(
        { id: selectedOperative.id, data: data as UpdateOperativeUserDTO },
        {
          onSuccess: () => {
            setViewMode('list');
            setSelectedOperative(null);
          },
        }
      );
    }
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <OperativeForm
        mode={viewMode}
        operative={selectedOperative}
        onSave={handleSave}
        onCancel={handleBack}
      />
    );
  }

  return (
    <>
      <OperativeList
        operatives={operatives}
        isLoading={isLoading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onToggleStatus={requestToggle}
        onDelete={requestDelete}
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

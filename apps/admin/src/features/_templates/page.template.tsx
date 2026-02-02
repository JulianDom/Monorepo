/**
 * Template de Pagina CRUD
 *
 * INSTRUCCIONES:
 * 1. Copiar este archivo a src/app/(dashboard)/dashboard/__feature__/page.tsx
 * 2. Reemplazar los placeholders:
 *    - __ENTITY__ -> Nombre del tipo (ej: Category)
 *    - __entity__ -> Nombre en minusculas (ej: category)
 *    - __entities__ -> Nombre plural minusculas (ej: categories)
 *    - __FEATURE_PATH__ -> Ruta del feature (ej: categories)
 */
'use client';

import { useState } from 'react';
import { __ENTITY__List } from '@/features/__FEATURE_PATH__/components/__ENTITY__List';
import { __ENTITY__Form } from '@/features/__FEATURE_PATH__/components/__ENTITY__Form';
import {
  use__ENTITY__s,
  useCreate__ENTITY__,
  useUpdate__ENTITY__,
  useDelete__ENTITY__,
  useToggle__ENTITY__Status,
  type __ENTITY__,
  type Create__ENTITY__DTO,
  type Update__ENTITY__DTO,
} from '@/features/__FEATURE_PATH__';

type ViewMode = 'list' | 'create' | 'edit';

export default function __ENTITY__sPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selected__ENTITY__, setSelected__ENTITY__] = useState<__ENTITY__ | null>(null);

  // React Query hooks
  const { data, isLoading } = use__ENTITY__s();
  const create__ENTITY__ = useCreate__ENTITY__();
  const update__ENTITY__ = useUpdate__ENTITY__();
  const delete__ENTITY__ = useDelete__ENTITY__();
  const toggleStatus = useToggle__ENTITY__Status();

  const __entities__ = data?.data ?? [];

  // Handlers
  const handleCreate = () => {
    setSelected__ENTITY__(null);
    setViewMode('create');
  };

  const handleEdit = (__entity__: __ENTITY__) => {
    setSelected__ENTITY__(__entity__);
    setViewMode('edit');
  };

  const handleBack = () => {
    setSelected__ENTITY__(null);
    setViewMode('list');
  };

  const handleSave = (data: Create__ENTITY__DTO | Update__ENTITY__DTO) => {
    if (viewMode === 'create') {
      create__ENTITY__.mutate(data as Create__ENTITY__DTO, {
        onSuccess: handleBack,
      });
    } else if (selected__ENTITY__) {
      update__ENTITY__.mutate(
        { id: selected__ENTITY__.id, data: data as Update__ENTITY__DTO },
        { onSuccess: handleBack }
      );
    }
  };

  const handleToggleStatus = (id: string, currentActive: boolean) => {
    toggleStatus.mutate({ id, enable: !currentActive });
  };

  const handleDelete = (id: string) => {
    delete__ENTITY__.mutate(id);
  };

  // Render
  if (viewMode !== 'list') {
    return (
      <__ENTITY__Form
        __entity__={selected__ENTITY__}
        onSave={handleSave}
        onCancel={handleBack}
        isLoading={create__ENTITY__.isPending || update__ENTITY__.isPending}
      />
    );
  }

  return (
    <__ENTITY__List
      __entities__={__entities__}
      isLoading={isLoading}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
    />
  );
}

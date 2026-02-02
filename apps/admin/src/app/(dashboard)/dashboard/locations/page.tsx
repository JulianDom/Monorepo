/**
 * =============================================================================
 * PÁGINA: Locales (Stores)
 * =============================================================================
 *
 * Gestión de locales/puntos de venta.
 * Permite: listar, crear, editar, activar/desactivar, importar desde Excel.
 */
'use client';

import { useState } from 'react';
import { LocationList } from '@/features/locations/components/LocationList';
import { LocationForm } from '@/features/locations/components/LocationForm';
import { LocationImport } from '@/features/locations/components/LocationImport';
import { LocationImportReport } from '@/features/locations/components/LocationImportReport';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useConfirmAction, getConfirmDialogTexts } from '@/hooks';
import {
  useStores,
  useCreateStore,
  useUpdateStore,
  useToggleStoreStatus,
  type Store,
  type CreateStoreDTO,
  type UpdateStoreDTO,
} from '@/features/locations';

// =============================================================================
// TIPOS
// =============================================================================

type ViewMode = 'list' | 'create' | 'edit' | 'import' | 'report';

export type ImportResult = {
  total: number;
  exitosos: number;
  errores: number;
  registros: ImportRecord[];
};

export type ImportRecord = {
  linea: number;
  codigo: string;
  nombre: string;
  estado: 'exito' | 'error';
  mensaje?: string;
};

// =============================================================================
// COMPONENTE
// =============================================================================

export default function LocationsPage() {
  // -------------------------------------------------------------------------
  // ESTADO LOCAL
  // -------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // -------------------------------------------------------------------------
  // REACT QUERY HOOKS
  // -------------------------------------------------------------------------
  const { data: storesData, isLoading } = useStores();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const toggleStatus = useToggleStoreStatus();

  const stores = storesData?.data ?? [];

  // -------------------------------------------------------------------------
  // HOOK DE CONFIRMACIÓN
  // -------------------------------------------------------------------------
  const { confirmState, requestToggle, cancel, confirm } = useConfirmAction<Store>({
    onToggle: (id, currentActive) => {
      toggleStatus.mutate({ id, enable: !currentActive });
    },
  });

  const dialogTexts = getConfirmDialogTexts(
    confirmState.type,
    confirmState.item,
    'Local',
    (store) => store.name
  );

  // -------------------------------------------------------------------------
  // HANDLERS DE NAVEGACIÓN
  // -------------------------------------------------------------------------
  const handleCreate = () => {
    setSelectedStore(null);
    setViewMode('create');
  };

  const handleEdit = (store: Store) => {
    setSelectedStore(store);
    setViewMode('edit');
  };

  const handleImport = () => {
    setViewMode('import');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedStore(null);
    setImportResult(null);
  };

  // -------------------------------------------------------------------------
  // HANDLERS DE FORMULARIO
  // -------------------------------------------------------------------------
  const handleSaveStore = (data: CreateStoreDTO | UpdateStoreDTO) => {
    if (selectedStore) {
      updateStore.mutate(
        { id: selectedStore.id, data: data as UpdateStoreDTO },
        { onSuccess: handleBackToList }
      );
    } else {
      createStore.mutate(data as CreateStoreDTO, { onSuccess: handleBackToList });
    }
  };

  const handleToggleStatus = (store: Store) => {
    requestToggle(store, store.active);
  };

  const handleImportComplete = (result: ImportResult) => {
    setImportResult(result);
    setViewMode('report');
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <>
      {/* Vista: Lista */}
      {viewMode === 'list' && (
        <LocationList
          stores={stores}
          isLoading={isLoading}
          onCreateStore={handleCreate}
          onEditStore={handleEdit}
          onToggleStatus={handleToggleStatus}
          onImport={handleImport}
        />
      )}

      {/* Vista: Crear/Editar */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <LocationForm
          store={selectedStore}
          onSave={handleSaveStore}
          onCancel={handleBackToList}
          isSubmitting={createStore.isPending || updateStore.isPending}
        />
      )}

      {/* Vista: Importar */}
      {viewMode === 'import' && (
        <LocationImport
          onImportComplete={handleImportComplete}
          onCancel={handleBackToList}
        />
      )}

      {/* Vista: Reporte de Importación */}
      {viewMode === 'report' && importResult && (
        <LocationImportReport
          result={importResult}
          onBack={handleBackToList}
        />
      )}

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        open={confirmState.isOpen}
        onOpenChange={(open) => !open && cancel()}
        title={dialogTexts.title}
        description={dialogTexts.description}
        confirmText={dialogTexts.confirmText}
        cancelText="Cancelar"
        variant={confirmState.type === 'delete' ? 'destructive' : 'default'}
        onConfirm={confirm}
        isLoading={toggleStatus.isPending}
      />
    </>
  );
}

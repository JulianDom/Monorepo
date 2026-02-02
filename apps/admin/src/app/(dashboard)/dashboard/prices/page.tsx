/**
 * =============================================================================
 * PÁGINA: Visualización de Precios
 * =============================================================================
 *
 * Página READ-ONLY para visualizar relevamientos de precios.
 * Los precios se registran desde la aplicación móvil de relevamiento.
 */
'use client';

import { useState } from 'react';
import { PriceList } from '@/features/prices/components/PriceList';
import { PriceDetail } from '@/features/prices/components/PriceDetail';
import {
  usePriceRecords,
  type PriceRecord,
} from '@/features/prices';

// =============================================================================
// TIPOS
// =============================================================================

type ViewMode = 'list' | 'detail';

// =============================================================================
// COMPONENTE
// =============================================================================

export default function PricesPage() {
  // -------------------------------------------------------------------------
  // ESTADO LOCAL
  // -------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRecord, setSelectedRecord] = useState<PriceRecord | null>(null);

  // -------------------------------------------------------------------------
  // REACT QUERY HOOKS
  // -------------------------------------------------------------------------
  const { data: priceRecordsData, isLoading } = usePriceRecords();

  const priceRecords = priceRecordsData?.data ?? [];

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const handleViewDetail = (record: PriceRecord) => {
    setSelectedRecord(record);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedRecord(null);
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <>
      {viewMode === 'list' && (
        <PriceList
          priceRecords={priceRecords}
          isLoading={isLoading}
          onViewDetail={handleViewDetail}
        />
      )}

      {viewMode === 'detail' && selectedRecord && (
        <PriceDetail
          record={selectedRecord}
          onBack={handleBackToList}
        />
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { PriceList } from '@/features/prices/components/PriceList';
import { PriceDetail } from '@/features/prices/components/PriceDetail';

export type PriceRecord = {
  id: string;
  productoId: string;
  productoCodigo: string;
  productoNombre: string;
  localId: string;
  localCodigo: string;
  localNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  precio: number;
  fecha: string;
  observaciones?: string;
};

export type PriceView = 'list' | 'detail';

const mockPriceRecords: PriceRecord[] = [
  {
    id: '1',
    productoId: '1',
    productoCodigo: 'PROD-001',
    productoNombre: 'Coca Cola 2.25L',
    localId: '1',
    localCodigo: 'LOC-001',
    localNombre: 'Sucursal Centro',
    usuarioId: '1',
    usuarioNombre: 'Juan Pérez',
    precio: 350.50,
    fecha: '2024-01-23T10:30:00Z',
    observaciones: 'Precio promocional vigente',
  },
  {
    id: '2',
    productoId: '2',
    productoCodigo: 'PROD-002',
    productoNombre: 'Leche La Serenísima 1L',
    localId: '1',
    localCodigo: 'LOC-001',
    localNombre: 'Sucursal Centro',
    usuarioId: '1',
    usuarioNombre: 'Juan Pérez',
    precio: 280.00,
    fecha: '2024-01-23T10:32:00Z',
  },
  {
    id: '3',
    productoId: '1',
    productoCodigo: 'PROD-001',
    productoNombre: 'Coca Cola 2.25L',
    localId: '2',
    localCodigo: 'LOC-002',
    localNombre: 'Sucursal Belgrano',
    usuarioId: '2',
    usuarioNombre: 'María González',
    precio: 365.00,
    fecha: '2024-01-23T11:15:00Z',
  },
];

export default function PricesPage() {
  const [priceRecords] = useState<PriceRecord[]>(mockPriceRecords);
  const [currentView, setCurrentView] = useState<PriceView>('list');
  const [selectedRecord, setSelectedRecord] = useState<PriceRecord | null>(null);

  const handleViewDetail = (record: PriceRecord) => {
    setSelectedRecord(record);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRecord(null);
  };

  return (
    <>
      {currentView === 'list' && (
        <PriceList
          priceRecords={priceRecords}
          onViewDetail={handleViewDetail}
        />
      )}

      {currentView === 'detail' && selectedRecord && (
        <PriceDetail
          record={selectedRecord}
          onBack={handleBackToList}
        />
      )}
    </>
  );
}

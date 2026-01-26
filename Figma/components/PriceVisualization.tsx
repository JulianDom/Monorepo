import { useState } from 'react';
import { PriceList } from './prices/PriceList';
import { PriceDetail } from './prices/PriceDetail';

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

// Mock data para relevamientos de precios
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
  {
    id: '4',
    productoId: '4',
    productoCodigo: 'PROD-004',
    productoNombre: 'Aceite Cocinero 900ml',
    localId: '1',
    localCodigo: 'LOC-001',
    localNombre: 'Sucursal Centro',
    usuarioId: '1',
    usuarioNombre: 'Juan Pérez',
    precio: 890.00,
    fecha: '2024-01-23T10:35:00Z',
  },
  {
    id: '5',
    productoId: '5',
    productoCodigo: 'PROD-005',
    productoNombre: 'Arroz Gallo Oro 1kg',
    localId: '4',
    localCodigo: 'LOC-004',
    localNombre: 'Sucursal Córdoba Centro',
    usuarioId: '3',
    usuarioNombre: 'Carlos Rodríguez',
    precio: 520.00,
    fecha: '2024-01-22T16:45:00Z',
  },
  {
    id: '6',
    productoId: '2',
    productoCodigo: 'PROD-002',
    productoNombre: 'Leche La Serenísima 1L',
    localId: '2',
    localCodigo: 'LOC-002',
    localNombre: 'Sucursal Belgrano',
    usuarioId: '2',
    usuarioNombre: 'María González',
    precio: 275.00,
    fecha: '2024-01-23T11:20:00Z',
    observaciones: 'Stock limitado',
  },
  {
    id: '7',
    productoId: '1',
    productoCodigo: 'PROD-001',
    productoNombre: 'Coca Cola 2.25L',
    localId: '5',
    localCodigo: 'LOC-005',
    localNombre: 'Sucursal Rosario',
    usuarioId: '4',
    usuarioNombre: 'Ana Martínez',
    precio: 355.00,
    fecha: '2024-01-23T09:30:00Z',
  },
  {
    id: '8',
    productoId: '4',
    productoCodigo: 'PROD-004',
    productoNombre: 'Aceite Cocinero 900ml',
    localId: '2',
    localCodigo: 'LOC-002',
    localNombre: 'Sucursal Belgrano',
    usuarioId: '2',
    usuarioNombre: 'María González',
    precio: 895.00,
    fecha: '2024-01-23T11:25:00Z',
  },
  {
    id: '9',
    productoId: '5',
    productoCodigo: 'PROD-005',
    productoNombre: 'Arroz Gallo Oro 1kg',
    localId: '1',
    localCodigo: 'LOC-001',
    localNombre: 'Sucursal Centro',
    usuarioId: '1',
    usuarioNombre: 'Juan Pérez',
    precio: 525.00,
    fecha: '2024-01-23T10:40:00Z',
  },
  {
    id: '10',
    productoId: '2',
    productoCodigo: 'PROD-002',
    productoNombre: 'Leche La Serenísima 1L',
    localId: '4',
    localCodigo: 'LOC-004',
    localNombre: 'Sucursal Córdoba Centro',
    usuarioId: '3',
    usuarioNombre: 'Carlos Rodríguez',
    precio: 285.00,
    fecha: '2024-01-22T16:50:00Z',
  },
  {
    id: '11',
    productoId: '1',
    productoCodigo: 'PROD-001',
    productoNombre: 'Coca Cola 2.25L',
    localId: '4',
    localCodigo: 'LOC-004',
    localNombre: 'Sucursal Córdoba Centro',
    usuarioId: '3',
    usuarioNombre: 'Carlos Rodríguez',
    precio: 360.00,
    fecha: '2024-01-22T16:55:00Z',
  },
  {
    id: '12',
    productoId: '4',
    productoCodigo: 'PROD-004',
    productoNombre: 'Aceite Cocinero 900ml',
    localId: '5',
    localCodigo: 'LOC-005',
    localNombre: 'Sucursal Rosario',
    usuarioId: '4',
    usuarioNombre: 'Ana Martínez',
    precio: 885.00,
    fecha: '2024-01-23T09:35:00Z',
  },
];

export function PriceVisualization() {
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

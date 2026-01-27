'use client';

import { useState } from 'react';
import { LocationList } from '@/features/locations/components/LocationList';
import { LocationForm } from '@/features/locations/components/LocationForm';
import { LocationImport } from '@/features/locations/components/LocationImport';
import { LocationImportReport } from '@/features/locations/components/LocationImportReport';

export type Location = {
  id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  telefono: string;
  email?: string;
  habilitado: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
};

export type LocationView = 'list' | 'create' | 'edit' | 'import' | 'report';

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

const mockLocations: Location[] = [
  {
    id: '1',
    codigo: 'LOC-001',
    nombre: 'Sucursal Centro',
    direccion: 'Av. Corrientes 1234',
    ciudad: 'Buenos Aires',
    provincia: 'CABA',
    telefono: '011-4444-5555',
    email: 'centro@empresa.com',
    habilitado: true,
    fechaCreacion: '2024-01-10T10:00:00Z',
    fechaModificacion: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    codigo: 'LOC-002',
    nombre: 'Sucursal Belgrano',
    direccion: 'Av. Cabildo 2500',
    ciudad: 'Buenos Aires',
    provincia: 'CABA',
    telefono: '011-4777-8888',
    email: 'belgrano@empresa.com',
    habilitado: true,
    fechaCreacion: '2024-01-11T11:30:00Z',
    fechaModificacion: '2024-01-11T11:30:00Z',
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [currentView, setCurrentView] = useState<LocationView>('list');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    setCurrentView('create');
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setCurrentView('edit');
  };

  const handleSaveLocation = (location: Omit<Location, 'id' | 'fechaCreacion' | 'fechaModificacion'>) => {
    const now = new Date().toISOString();

    if (selectedLocation) {
      setLocations(locations.map(l =>
        l.id === selectedLocation.id
          ? { ...location, id: l.id, fechaCreacion: l.fechaCreacion, fechaModificacion: now }
          : l
      ));
    } else {
      const newLocation: Location = {
        ...location,
        id: String(Date.now()),
        fechaCreacion: now,
        fechaModificacion: now,
      };
      setLocations([newLocation, ...locations]);
    }

    setCurrentView('list');
    setSelectedLocation(null);
  };

  const handleToggleEnabled = (locationId: string) => {
    setLocations(locations.map(l =>
      l.id === locationId
        ? { ...l, habilitado: !l.habilitado, fechaModificacion: new Date().toISOString() }
        : l
    ));
  };

  const handleImport = () => {
    setCurrentView('import');
  };

  const handleImportComplete = (result: ImportResult) => {
    setImportResult(result);
    setCurrentView('report');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedLocation(null);
    setImportResult(null);
  };

  return (
    <>
      {currentView === 'list' && (
        <LocationList
          locations={locations}
          onCreateLocation={handleCreateLocation}
          onEditLocation={handleEditLocation}
          onToggleEnabled={handleToggleEnabled}
          onImport={handleImport}
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <LocationForm
          location={selectedLocation}
          onSave={handleSaveLocation}
          onCancel={handleBackToList}
        />
      )}

      {currentView === 'import' && (
        <LocationImport
          onImportComplete={handleImportComplete}
          onCancel={handleBackToList}
        />
      )}

      {currentView === 'report' && importResult && (
        <LocationImportReport
          result={importResult}
          onBack={handleBackToList}
        />
      )}
    </>
  );
}

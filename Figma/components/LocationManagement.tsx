import { useState } from 'react';
import { LocationList } from './locations/LocationList';
import { LocationForm } from './locations/LocationForm';
import { LocationImport } from './locations/LocationImport';
import { LocationImportReport } from './locations/LocationImportReport';

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

// Mock data para locales
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
  {
    id: '3',
    codigo: 'LOC-003',
    nombre: 'Sucursal Palermo',
    direccion: 'Av. Santa Fe 3800',
    ciudad: 'Buenos Aires',
    provincia: 'CABA',
    telefono: '011-4888-9999',
    habilitado: false,
    fechaCreacion: '2024-01-09T09:15:00Z',
    fechaModificacion: '2024-01-20T14:30:00Z',
  },
  {
    id: '4',
    codigo: 'LOC-004',
    nombre: 'Sucursal Córdoba Centro',
    direccion: 'San Martín 500',
    ciudad: 'Córdoba',
    provincia: 'Córdoba',
    telefono: '0351-4222-3333',
    email: 'cordoba@empresa.com',
    habilitado: true,
    fechaCreacion: '2024-01-12T13:20:00Z',
    fechaModificacion: '2024-01-12T13:20:00Z',
  },
  {
    id: '5',
    codigo: 'LOC-005',
    nombre: 'Sucursal Rosario',
    direccion: 'Córdoba 950',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    telefono: '0341-4555-6666',
    email: 'rosario@empresa.com',
    habilitado: true,
    fechaCreacion: '2024-01-13T16:45:00Z',
    fechaModificacion: '2024-01-13T16:45:00Z',
  },
  {
    id: '6',
    codigo: 'LOC-006',
    nombre: 'Sucursal Mendoza',
    direccion: 'San Martín 1200',
    ciudad: 'Mendoza',
    provincia: 'Mendoza',
    telefono: '0261-4333-4444',
    habilitado: true,
    fechaCreacion: '2024-01-14T10:00:00Z',
    fechaModificacion: '2024-01-14T10:00:00Z',
  },
];

export function LocationManagement() {
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
      // Edit existing location
      setLocations(locations.map(l => 
        l.id === selectedLocation.id 
          ? { ...location, id: l.id, fechaCreacion: l.fechaCreacion, fechaModificacion: now }
          : l
      ));
    } else {
      // Create new location
      const newLocation: Location = {
        ...location,
        id: `${Date.now()}`,
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
    // In a real app, this would update the locations list
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

'use client';

import { useState } from 'react';
import { OperativeList } from '@/features/operatives/components/operative-list';
import { OperativeForm } from '@/features/operatives/components/operative-form';

export interface Operative {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastAccess?: string;
  status: 'active' | 'inactive';
}

type ViewMode = 'list' | 'create' | 'edit';

const mockOperatives: Operative[] = [
  {
    id: '1',
    name: 'Roberto Sánchez',
    email: 'roberto.sanchez@empresa.com',
    phone: '+54 11 2345-6789',
    createdAt: '2025-01-20T10:00:00Z',
    lastAccess: '2025-01-23T14:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'Laura Gómez',
    email: 'laura.gomez@empresa.com',
    phone: '+54 11 3456-7890',
    createdAt: '2025-01-18T09:00:00Z',
    lastAccess: '2025-01-23T11:15:00Z',
    status: 'active',
  },
  {
    id: '3',
    name: 'Diego Morales',
    email: 'diego.morales@empresa.com',
    phone: '+54 11 4567-8901',
    createdAt: '2025-01-15T14:00:00Z',
    lastAccess: '2025-01-22T16:45:00Z',
    status: 'inactive',
  },
  {
    id: '4',
    name: 'Sofía Castro',
    email: 'sofia.castro@empresa.com',
    phone: '+54 11 5678-9012',
    createdAt: '2025-01-12T11:00:00Z',
    lastAccess: '2025-01-23T09:20:00Z',
    status: 'active',
  },
  {
    id: '5',
    name: 'Martín Torres',
    email: 'martin.torres@empresa.com',
    createdAt: '2025-01-10T08:00:00Z',
    lastAccess: '2025-01-21T15:30:00Z',
    status: 'active',
  },
  {
    id: '6',
    name: 'Valeria Ruiz',
    email: 'valeria.ruiz@empresa.com',
    phone: '+54 11 6789-0123',
    createdAt: '2025-01-08T13:00:00Z',
    status: 'inactive',
  },
];

export default function OperativesPage() {
  const [operatives, setOperatives] = useState<Operative[]>(mockOperatives);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedOperative, setSelectedOperative] = useState<Operative | null>(null);

  const handleCreate = () => {
    setSelectedOperative(null);
    setViewMode('create');
  };

  const handleEdit = (operative: Operative) => {
    setSelectedOperative(operative);
    setViewMode('edit');
  };

  const handleBack = () => {
    setSelectedOperative(null);
    setViewMode('list');
  };

  const handleSave = (data: Omit<Operative, 'id' | 'createdAt' | 'lastAccess'>) => {
    if (viewMode === 'create') {
      const newOperative: Operative = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      setOperatives([newOperative, ...operatives]);
    } else if (viewMode === 'edit' && selectedOperative) {
      setOperatives(
        operatives.map((op) =>
          op.id === selectedOperative.id
            ? { ...op, ...data }
            : op
        )
      );
    }
    handleBack();
  };

  const handleToggleStatus = (operativeId: string) => {
    setOperatives(
      operatives.map((op) =>
        op.id === operativeId
          ? { ...op, status: op.status === 'active' ? 'inactive' : 'active' }
          : op
      )
    );
  };

  const handleDelete = (operativeId: string) => {
    setOperatives(operatives.filter((op) => op.id !== operativeId));
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
    <OperativeList
      operatives={operatives}
      onCreate={handleCreate}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
    />
  );
}

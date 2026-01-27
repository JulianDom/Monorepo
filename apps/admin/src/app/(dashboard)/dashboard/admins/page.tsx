'use client';

import { useState } from 'react';
import { AdminList } from '@/features/admins/components/admin-list';
import { AdminForm } from '@/features/admins/components/admin-form';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Confirmation dialogs
  const [confirmDisable, setConfirmDisable] = useState<Admin | null>(null);
  const [confirmEnable, setConfirmEnable] = useState<Admin | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Admin | null>(null);

  // Mock data
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: '1',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@empresa.com',
      role: 'Administrador General',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      lastLogin: '2025-01-23T08:45:00Z',
    },
    {
      id: '2',
      name: 'María Fernández',
      email: 'maria.fernandez@empresa.com',
      role: 'Administrador de Contenido',
      isActive: true,
      createdAt: '2024-02-20T14:20:00Z',
      lastLogin: '2025-01-22T16:30:00Z',
    },
    {
      id: '3',
      name: 'Juan Martínez',
      email: 'juan.martinez@empresa.com',
      role: 'Administrador de Usuarios',
      isActive: false,
      createdAt: '2024-03-10T09:15:00Z',
      lastLogin: '2025-01-10T11:20:00Z',
    },
    {
      id: '4',
      name: 'Ana López',
      email: 'ana.lopez@empresa.com',
      role: 'Administrador General',
      isActive: true,
      createdAt: '2024-04-05T11:00:00Z',
      lastLogin: '2025-01-23T09:15:00Z',
    },
    {
      id: '5',
      name: 'Pedro García',
      email: 'pedro.garcia@empresa.com',
      role: 'Administrador de Reportes',
      isActive: true,
      createdAt: '2024-05-12T15:45:00Z',
      lastLogin: '2025-01-21T14:00:00Z',
    },
  ]);

  const handleCreateAdmin = () => {
    setViewMode('create');
    setSelectedAdmin(null);
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setViewMode('edit');
  };

  const handleSaveAdmin = (adminData: Omit<Admin, 'id' | 'createdAt' | 'lastLogin'>) => {
    if (viewMode === 'create') {
      const newAdmin: Admin = {
        ...adminData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setAdmins([...admins, newAdmin]);
      toast.success('Administrador creado exitosamente');
    } else if (viewMode === 'edit' && selectedAdmin) {
      setAdmins(
        admins.map((admin) =>
          admin.id === selectedAdmin.id
            ? { ...admin, ...adminData }
            : admin
        )
      );
      toast.success('Administrador actualizado exitosamente');
    }
    setViewMode('list');
    setSelectedAdmin(null);
  };

  const handleCancelForm = () => {
    setViewMode('list');
    setSelectedAdmin(null);
  };

  const handleToggleStatus = (admin: Admin) => {
    if (admin.isActive) {
      setConfirmDisable(admin);
    } else {
      setConfirmEnable(admin);
    }
  };

  const confirmToggleStatus = () => {
    const admin = confirmDisable || confirmEnable;
    if (!admin) return;

    const wasActive = admin.isActive;

    setAdmins(
      admins.map((a) =>
        a.id === admin.id ? { ...a, isActive: !a.isActive } : a
      )
    );

    if (wasActive) {
      toast.warning('Administrador deshabilitado', {
        description: `${admin.name} ha sido deshabilitado y su sesión ha sido cerrada.`,
      });
    } else {
      toast.success('Administrador habilitado', {
        description: `${admin.name} ahora puede acceder al sistema.`,
      });
    }

    setConfirmDisable(null);
    setConfirmEnable(null);
  };

  const handleDeleteAdmin = (admin: Admin) => {
    setConfirmDelete(admin);
  };

  const confirmDeleteAdmin = () => {
    if (!confirmDelete) return;

    setAdmins(admins.filter((admin) => admin.id !== confirmDelete.id));
    setConfirmDelete(null);
    toast.success('Administrador eliminado exitosamente');
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <AdminForm
        mode={viewMode}
        initialData={selectedAdmin}
        onSave={handleSaveAdmin}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <>
      <AdminList
        admins={admins}
        onCreateAdmin={handleCreateAdmin}
        onEditAdmin={handleEditAdmin}
        onToggleStatus={handleToggleStatus}
        onDeleteAdmin={handleDeleteAdmin}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ConfirmDialog
        isOpen={!!confirmDisable}
        onClose={() => setConfirmDisable(null)}
        onConfirm={confirmToggleStatus}
        title="Deshabilitar Administrador"
        description={
          <>
            ¿Estás seguro que deseas deshabilitar a <strong>{confirmDisable?.name}</strong>?
            <br /><br />
            Esta acción cerrará inmediatamente su sesión actual y no podrá acceder al sistema hasta que sea habilitado nuevamente.
          </>
        }
        confirmText="Deshabilitar"
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={!!confirmEnable}
        onClose={() => setConfirmEnable(null)}
        onConfirm={confirmToggleStatus}
        title="Habilitar Administrador"
        description={
          <>
            ¿Estás seguro que deseas habilitar a <strong>{confirmEnable?.name}</strong>?
            <br /><br />
            Podrá acceder al sistema nuevamente.
          </>
        }
        confirmText="Habilitar"
        variant="default"
      />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteAdmin}
        title="Eliminar Administrador"
        description={
          <>
            ¿Estás seguro que deseas eliminar a <strong>{confirmDelete?.name}</strong>?
            <br /><br />
            Esta acción no se puede deshacer y se perderán todos los datos asociados.
          </>
        }
        confirmText="Eliminar"
        variant="destructive"
      />
    </>
  );
}

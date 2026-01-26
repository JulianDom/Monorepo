import { useState } from 'react';
import { ProductList } from './products/ProductList';
import { ProductForm } from './products/ProductForm';
import { ProductImport } from './products/ProductImport';
import { ImportReport } from './products/ImportReport';

export type Product = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  marca: string;
  categoria: string;
  precio: number;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
};

export type ProductView = 'list' | 'create' | 'edit' | 'import' | 'report';

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

// Mock data para productos
const mockProducts: Product[] = [
  {
    id: '1',
    codigo: 'PROD-001',
    nombre: 'Coca Cola 2.25L',
    descripcion: 'Bebida gaseosa sabor cola',
    marca: 'Coca Cola',
    categoria: 'Bebidas',
    precio: 350.50,
    activo: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    fechaModificacion: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    codigo: 'PROD-002',
    nombre: 'Leche La Serenísima 1L',
    descripcion: 'Leche entera fortificada',
    marca: 'La Serenísima',
    categoria: 'Lácteos',
    precio: 280.00,
    activo: true,
    fechaCreacion: '2024-01-16T11:30:00Z',
    fechaModificacion: '2024-01-16T11:30:00Z',
  },
  {
    id: '3',
    codigo: 'PROD-003',
    nombre: 'Pan Lactal Bimbo',
    descripcion: 'Pan de molde blanco',
    marca: 'Bimbo',
    categoria: 'Panadería',
    precio: 420.00,
    activo: false,
    fechaCreacion: '2024-01-14T09:15:00Z',
    fechaModificacion: '2024-01-20T14:30:00Z',
  },
  {
    id: '4',
    codigo: 'PROD-004',
    nombre: 'Aceite Cocinero 900ml',
    descripcion: 'Aceite de girasol alto oleico',
    marca: 'Cocinero',
    categoria: 'Almacén',
    precio: 890.00,
    activo: true,
    fechaCreacion: '2024-01-17T13:20:00Z',
    fechaModificacion: '2024-01-17T13:20:00Z',
  },
  {
    id: '5',
    codigo: 'PROD-005',
    nombre: 'Arroz Gallo Oro 1kg',
    descripcion: 'Arroz tipo doble carolina',
    marca: 'Gallo Oro',
    categoria: 'Almacén',
    precio: 520.00,
    activo: true,
    fechaCreacion: '2024-01-18T16:45:00Z',
    fechaModificacion: '2024-01-18T16:45:00Z',
  },
];

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [currentView, setCurrentView] = useState<ProductView>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setCurrentView('create');
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('edit');
  };

  const handleSaveProduct = (product: Omit<Product, 'id' | 'fechaCreacion' | 'fechaModificacion'>) => {
    const now = new Date().toISOString();
    
    if (selectedProduct) {
      // Edit existing product
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...product, id: p.id, fechaCreacion: p.fechaCreacion, fechaModificacion: now }
          : p
      ));
    } else {
      // Create new product
      const newProduct: Product = {
        ...product,
        id: `${Date.now()}`,
        fechaCreacion: now,
        fechaModificacion: now,
      };
      setProducts([newProduct, ...products]);
    }
    
    setCurrentView('list');
    setSelectedProduct(null);
  };

  const handleToggleActive = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId
        ? { ...p, activo: !p.activo, fechaModificacion: new Date().toISOString() }
        : p
    ));
  };

  const handleImport = () => {
    setCurrentView('import');
  };

  const handleImportComplete = (result: ImportResult) => {
    // In a real app, this would update the products list
    setImportResult(result);
    setCurrentView('report');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProduct(null);
    setImportResult(null);
  };

  return (
    <>
      {currentView === 'list' && (
        <ProductList
          products={products}
          onCreateProduct={handleCreateProduct}
          onEditProduct={handleEditProduct}
          onToggleActive={handleToggleActive}
          onImport={handleImport}
        />
      )}
      
      {(currentView === 'create' || currentView === 'edit') && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSaveProduct}
          onCancel={handleBackToList}
        />
      )}
      
      {currentView === 'import' && (
        <ProductImport
          onImportComplete={handleImportComplete}
          onCancel={handleBackToList}
        />
      )}
      
      {currentView === 'report' && importResult && (
        <ImportReport
          result={importResult}
          onBack={handleBackToList}
        />
      )}
    </>
  );
}

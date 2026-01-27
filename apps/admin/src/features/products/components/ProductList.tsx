import { useState } from "react";
import {
  Plus,
  Search,
  FileUp,
  Edit,
  Power,
  Package,
  ArrowUpDown,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/app/(dashboard)/dashboard/products/page";
import { Pagination } from "@/components/shared/pagination";
import { cn } from "@/lib/utils";

interface ProductListProps {
  products: Product[];
  onCreateProduct: () => void;
  onEditProduct: (product: Product) => void;
  onToggleActive: (productId: string) => void;
  onImport: () => void;
}

type SortField = "codigo" | "nombre" | "marca" | "categoria";
type SortOrder = "asc" | "desc";

export function ProductList({
  products,
  onCreateProduct,
  onEditProduct,
  onToggleActive,
  onImport,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] =
    useState<SortField>("nombre");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.codigo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.marca
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      product.categoria
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && product.activo) ||
      (filterStatus === "inactive" && !product.activo);

    return matchesSearch && matchesStatus;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;

    if (sortField === "codigo") {
      comparison = a.codigo.localeCompare(b.codigo);
    } else if (sortField === "nombre") {
      comparison = a.nombre.localeCompare(b.nombre);
    } else if (sortField === "marca") {
      comparison = a.marca.localeCompare(b.marca);
    } else if (sortField === "categoria") {
      comparison = a.categoria.localeCompare(b.categoria);
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(
    sortedProducts.length / itemsPerPage,
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const activeCount = products.filter((p) => p.activo).length;
  const totalCount = products.length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <div>
            <h3>Gestión de Productos</h3>
            <p className="text-muted-foreground text-sm">
              Administra el catálogo de productos del sistema
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onImport}
            variant="outline"
            className="flex-1 md:flex-none gap-2"
          >
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">
              Importar Excel
            </span>
            <span className="sm:hidden">Importar</span>
          </Button>
          <Button
            onClick={onCreateProduct}
            className="flex-1 md:flex-none gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nombre, marca o categoría"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table className="lg:min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort("codigo")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Código
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("nombre")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Nombre
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("marca")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Marca
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("categoria")}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    Categoría
                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                  </button>
                </TableHead>
                <TableHead>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: any) =>
                      setFilterStatus(value)
                    }
                  >
                    <SelectTrigger className="w-full border-0 shadow-none hover:bg-muted/50 focus:ring-0 h-auto p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todos los estados
                      </SelectItem>
                      <SelectItem value="active">
                        Activos
                      </SelectItem>
                      <SelectItem value="inactive">
                        Inactivos
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableHead>
                <TableHead className="text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No se encontraron productos
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {product.codigo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {product.nombre}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {product.marca}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {product.categoria}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.activo
                            ? "default"
                            : "secondary"
                        }
                        className={
                          product.activo
                            ? "bg-green-600 text-white hover:bg-green-700 border-0"
                            : "bg-muted text-muted-foreground hover:bg-muted border-0"
                        }
                      >
                        {product.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onToggleActive(product.id)
                          }
                          className="h-8 w-8 p-0 hover:bg-accent"
                          title={product.activo ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {sortedProducts.length > 0 && (
          <div className="border-t border-border px-4 md:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={sortedProducts.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
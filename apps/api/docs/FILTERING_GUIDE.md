# Guía de Filtros y Paginación para el Frontend

Esta guía explica cómo consumir los endpoints de la API con filtros, paginación y ordenamiento.

## Formato General de Query Params

```
GET /api/v1/{resource}?page=1&limit=10&sort=-createdAt&search=texto&filtro=valor
```

## Paginación

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página (comienza en 1) |
| `limit` | number | 10 | Items por página (máx: 100) |

### Ejemplo
```http
GET /api/v1/products?page=2&limit=20
```

### Respuesta de Paginación
```json
{
  "data": [...],
  "meta": {
    "currentPage": 2,
    "itemsPerPage": 20,
    "totalItems": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

---

## Ordenamiento (sort)

Usa el parámetro `sort` para ordenar los resultados.

| Formato | Significado |
|---------|-------------|
| `sort=campo` | Orden ascendente por campo |
| `sort=-campo` | Orden descendente por campo (nota el `-`) |
| `sort=campo1,-campo2` | Múltiples campos separados por coma |

### Ejemplos
```http
# Productos más recientes primero
GET /api/v1/products?sort=-createdAt

# Productos por nombre A-Z
GET /api/v1/products?sort=name

# Precio descendente, luego nombre ascendente
GET /api/v1/products?sort=-unitPrice,name
```

### Campos Ordenables por Recurso

| Recurso | Campos ordenables |
|---------|-------------------|
| products | name, sku, unitPrice, category, brand, createdAt, updatedAt |
| stores | name, code, city, createdAt |
| operative-users | fullName, email, createdAt |
| price-records | recordedAt, price, createdAt |
| administrators | fullName, email, createdAt |

---

## Búsqueda Global (search)

El parámetro `search` busca en múltiples campos configurados para cada recurso.

```http
GET /api/v1/products?search=coca cola
```

### Campos de Búsqueda por Recurso

| Recurso | Busca en |
|---------|----------|
| products | name, sku, barcode, description |
| stores | name, code, address |
| operative-users | fullName, email, employeeCode |
| administrators | fullName, email, username |

---

## Filtros Específicos

Cada recurso tiene filtros específicos. Se pasan como query params simples.

### Products
```http
# Filtrar por categoría
GET /api/v1/products?category=bebidas

# Filtrar por marca
GET /api/v1/products?brand=Coca-Cola

# Rango de precios
GET /api/v1/products?minPrice=100&maxPrice=500

# Solo activos
GET /api/v1/products?activeOnly=true

# Combinando filtros
GET /api/v1/products?category=bebidas&brand=Coca-Cola&activeOnly=true&sort=-unitPrice
```

### Stores
```http
# Filtrar por ciudad
GET /api/v1/stores?city=Buenos Aires

# Filtrar por estado/provincia
GET /api/v1/stores?state=CABA

# Solo activos
GET /api/v1/stores?activeOnly=true
```

### Operative Users
```http
# Filtrar por creador
GET /api/v1/operative-users?createdById=uuid-del-admin

# Solo activos
GET /api/v1/operative-users?activeOnly=true
```

### Price Records
```http
# Filtrar por producto
GET /api/v1/price-records?productId=uuid

# Filtrar por local
GET /api/v1/price-records?storeId=uuid

# Filtrar por usuario operativo
GET /api/v1/price-records?operativeUserId=uuid

# Rango de fechas (ISO 8601)
GET /api/v1/price-records?dateFrom=2024-01-01&dateTo=2024-12-31

# Combinando
GET /api/v1/price-records?productId=uuid&storeId=uuid&dateFrom=2024-06-01&sort=-recordedAt
```

### Administrators
```http
# Solo habilitados
GET /api/v1/administrators?enabledOnly=true
```

---

## Incluir Relaciones (include)

Algunos recursos permiten expandir relaciones relacionadas.

```http
GET /api/v1/price-records?include=product,store,operativeUser
```

### Relaciones Disponibles

| Recurso | Relaciones disponibles |
|---------|------------------------|
| price-records | product, store, operativeUser |

---

## Ejemplos Completos

### Buscar productos de bebidas económicos
```http
GET /api/v1/products?search=cola&category=bebidas&maxPrice=200&activeOnly=true&sort=unitPrice&page=1&limit=10
```

### Ver precios de un producto en enero 2024
```http
GET /api/v1/price-records?productId=abc123&dateFrom=2024-01-01&dateTo=2024-01-31&sort=-recordedAt&include=store
```

### Buscar usuarios operativos activos
```http
GET /api/v1/operative-users?search=juan&activeOnly=true&sort=fullName&page=1&limit=20
```

### Ver locales en Buenos Aires
```http
GET /api/v1/stores?city=Buenos Aires&activeOnly=true&sort=name
```

---

## Ejemplo de Implementación en React/TypeScript

```typescript
// types.ts
interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

interface ProductFilters extends PaginationParams {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  activeOnly?: boolean;
}

// api.ts
const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

const getProducts = async (filters: ProductFilters) => {
  const queryString = buildQueryString(filters);
  const response = await fetch(`/api/v1/products?${queryString}`);
  return response.json();
};

// Uso
const { data, meta } = await getProducts({
  search: 'coca',
  category: 'bebidas',
  maxPrice: 500,
  activeOnly: true,
  sort: '-unitPrice',
  page: 1,
  limit: 20,
});
```

---

## Notas Importantes

1. **Valores booleanos**: Usar `true` o `false` como string
   ```http
   ?activeOnly=true ✅
   ?activeOnly=1    ❌
   ```

2. **Fechas**: Usar formato ISO 8601
   ```http
   ?dateFrom=2024-01-01 ✅
   ?dateFrom=01/01/2024 ❌
   ```

3. **UUIDs**: Deben ser UUIDs válidos
   ```http
   ?productId=123e4567-e89b-12d3-a456-426614174000 ✅
   ?productId=123 ❌
   ```

4. **Límite máximo**: El parámetro `limit` tiene un máximo de 100

5. **Case sensitivity**: Los filtros de texto (category, brand, city) son case-sensitive para igualdad exacta. El `search` es case-insensitive.

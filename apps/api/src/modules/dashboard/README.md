# Patrón: Endpoints de Agregación

Este módulo implementa el patrón de **Endpoints de Agregación** para casos donde el frontend necesita datos de múltiples entidades en una sola vista.

## Problema

Cuando una vista del frontend (como un dashboard) necesita datos de múltiples entidades, hay dos enfoques:

### Enfoque 1: Múltiples llamadas desde el frontend (No recomendado)

```typescript
// Frontend hace N llamadas
const [admins, products, stores] = await Promise.all([
  adminService.list({ page: 1, limit: 1 }),
  productService.list({ page: 1, limit: 1 }),
  storeService.list({ page: 1, limit: 1 }),
]);
```

**Problemas:**
- Múltiples requests HTTP (latencia de red multiplicada)
- Más carga en el servidor (N requests en lugar de 1)
- El frontend debe conocer la lógica de agregación
- Difícil de optimizar las queries individuales

### Enfoque 2: Endpoint de agregación (Recomendado)

```typescript
// Frontend hace 1 llamada
const stats = await dashboardService.getStats();
```

**Ventajas:**
- Una sola request HTTP
- Backend optimiza queries con `Promise.all`
- Lógica de agregación centralizada en el backend
- Fácil de cachear a nivel de endpoint
- Mejor control sobre qué datos se exponen

## Estructura del Módulo

```
modules/dashboard/
├── dashboard.module.ts      # Definición del módulo
├── dashboard.controller.ts  # Endpoints HTTP
├── dashboard.service.ts     # Lógica de agregación
├── dto/
│   ├── index.ts
│   └── dashboard-stats.dto.ts  # DTOs de respuesta
├── index.ts                 # Exports públicos
└── README.md               # Esta documentación
```

## Cuándo Usar Este Patrón

✅ **Usar cuando:**
- Dashboard con métricas de múltiples entidades
- Reportes que combinan datos de varias tablas
- Vistas que requieren datos agregados o calculados
- La vista siempre necesita los mismos datos juntos

❌ **No usar cuando:**
- Los datos se consumen de forma independiente
- El usuario puede elegir qué datos ver
- Los datos tienen diferentes frecuencias de actualización

## Implementación Backend

### 1. Service

```typescript
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsResponseDto> {
    // Ejecutar queries en paralelo para optimizar
    const [
      adminsTotal,
      adminsActive,
      // ... más queries
    ] = await Promise.all([
      this.prisma.administrator.count({ where: { deletedAt: null } }),
      this.prisma.administrator.count({ where: { deletedAt: null, enabled: true } }),
      // ... más queries
    ]);

    return {
      admins: { total: adminsTotal, active: adminsActive },
      // ... más datos
    };
  }
}
```

### 2. Controller

```typescript
@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  async getStats(): Promise<DashboardStatsResponseDto> {
    return this.dashboardService.getStats();
  }
}
```

### 3. DTOs

```typescript
export class EntityStatsDto {
  @ApiProperty({ description: 'Total de registros' })
  total!: number;

  @ApiProperty({ description: 'Registros activos' })
  active!: number;
}

export class DashboardStatsResponseDto {
  @ApiProperty({ type: EntityStatsDto })
  admins!: EntityStatsDto;
  // ... más campos
}
```

## Implementación Frontend

### 1. Service

```typescript
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>(ENDPOINTS.DASHBOARD.STATS);
  },
};
```

### 2. Hook

```typescript
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: dashboardService.getStats,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  });
}
```

### 3. Componente

```typescript
export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <StatCard title="Admins" value={stats.admins.total} />
      {/* ... más cards */}
    </div>
  );
}
```

## Extendiendo el Dashboard

Para agregar nuevas métricas:

1. **Backend:** Agregar queries al service y campos al DTO
2. **Frontend:** Actualizar tipos y usar los nuevos campos

```typescript
// Backend - dashboard.service.ts
const [
  // ... queries existentes
  newMetric,
] = await Promise.all([
  // ... queries existentes
  this.prisma.newEntity.count({ where: { deletedAt: null } }),
]);

return {
  // ... datos existentes
  newMetric: { total: newMetric },
};
```

## Consideraciones de Performance

1. **Usar `Promise.all`**: Ejecuta queries en paralelo
2. **Usar `count()` en lugar de `findMany().length`**: Más eficiente
3. **Considerar cache a nivel de endpoint**: Para dashboards con alta carga
4. **Limitar campos retornados**: Solo devolver lo necesario

## Otros Endpoints de Agregación Comunes

- `/reports/sales-summary` - Resumen de ventas
- `/analytics/user-activity` - Actividad de usuarios
- `/metrics/system-health` - Métricas del sistema

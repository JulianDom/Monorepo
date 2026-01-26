export type ReportType = 'projects' | 'tasks' | 'clients' | 'users';
export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface ReportFilter {
  type: ReportType;
  period: ReportPeriod;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  projectId?: string;
  status?: string;
}

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  metrics: ReportMetric[];
  generatedAt: string;
}

export interface ReportMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const reportTypeLabels: Record<ReportType, string> = {
  projects: 'Proyectos',
  tasks: 'Tareas',
  clients: 'Clientes',
  users: 'Usuarios',
};

export const reportPeriodLabels: Record<ReportPeriod, string> = {
  week: 'Última semana',
  month: 'Último mes',
  quarter: 'Último trimestre',
  year: 'Último año',
  custom: 'Personalizado',
};

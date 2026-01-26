/**
 * Tipos base para Entidades
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface SoftDeletable {
  deletedAt: Date | null;
}

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateInput<T> = Partial<CreateInput<T>>;

export interface FindOptions {
  includeDeleted?: boolean;
}

export interface WhereCondition {
  [key: string]: unknown;
}

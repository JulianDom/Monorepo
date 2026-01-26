import { IAdministratorRepository } from '@core/application/ports/repositories';

export interface ListAdministratorsInput {
  page?: number;
  limit?: number;
  enabledOnly?: boolean;
}

export interface AdministratorListItem {
  id: string;
  fullName: string;
  email: string;
  username: string;
  enabled: boolean;
  createdAt: Date;
}

export interface ListAdministratorsOutput {
  data: AdministratorListItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * ListAdministratorsUseCase
 *
 * Lista todos los administradores con paginación.
 */
export class ListAdministratorsUseCase {
  constructor(private readonly adminRepository: IAdministratorRepository) {}

  async execute(input: ListAdministratorsInput): Promise<ListAdministratorsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 10;
    const enabledOnly = input.enabledOnly ?? false;

    const result = await this.adminRepository.findAll(page, limit, enabledOnly);

    return {
      data: result.data.map((admin) => ({
        id: admin.id!,
        fullName: admin.fullName,
        email: admin.emailAddress,
        username: admin.username,
        enabled: admin.enabled,
        createdAt: admin.createdAt!,
      })),
      total: result.total,
      page,
      limit,
    };
  }
}

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { OperativeUser, Prisma } from '@prisma/client';
import {
  CreateOperativeUserDto,
  UpdateOperativeUserDto,
  OperativeUserQueryDto,
} from './dto';
import {
  buildPaginatedResponse,
  PaginatedResponse,
} from '@common/dto';
import {
  parseSort,
  buildSearchCondition,
  calculateSkip,
} from '@common/utils';
// Importamos el password hasher existente
import { PasswordHasherService } from '@infra/security/authentication';

const SORTABLE_FIELDS = ['fullName', 'username', 'createdAt', 'updatedAt'] as const;
const SEARCHABLE_FIELDS = ['fullName', 'emailAddress', 'username'];

// Tipo para operativeUser sin campos sensibles
type SafeOperativeUser = Omit<OperativeUser, 'password' | 'refreshToken' | 'recoverPasswordID'>;

@Injectable()
export class OperativeUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async findAll(query: OperativeUserQueryDto): Promise<PaginatedResponse<SafeOperativeUser>> {
    const { page = 1, limit = 10, sort, search, enabledOnly } = query;

    const skip = calculateSkip(page, limit);
    const orderBy = parseSort(sort, [...SORTABLE_FIELDS]);

    const where: Prisma.OperativeUserWhereInput = {
      deletedAt: null,
      ...(enabledOnly && { enabled: true }),
      ...buildSearchCondition(search, SEARCHABLE_FIELDS),
    };

    const [data, total] = await Promise.all([
      this.prisma.operativeUser.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          fullName: true,
          emailAddress: true,
          username: true,
          enabled: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      this.prisma.operativeUser.count({ where }),
    ]);

    return buildPaginatedResponse(data as SafeOperativeUser[], total, page, limit);
  }

  async findById(id: string): Promise<SafeOperativeUser> {
    const user = await this.prisma.operativeUser.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        fullName: true,
        emailAddress: true,
        username: true,
        enabled: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Operative user with id '${id}' not found`);
    }

    return user as SafeOperativeUser;
  }

  async create(dto: CreateOperativeUserDto, createdById: string): Promise<SafeOperativeUser> {
    // Verificar email duplicado
    const existsByEmail = await this.prisma.operativeUser.count({
      where: { emailAddress: dto.email, deletedAt: null },
    });
    if (existsByEmail > 0) {
      throw new ConflictException('An operative user with this email already exists');
    }

    // Verificar username duplicado
    const existsByUsername = await this.prisma.operativeUser.count({
      where: { username: dto.username, deletedAt: null },
    });
    if (existsByUsername > 0) {
      throw new ConflictException('An operative user with this username already exists');
    }

    // Hashear password
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    const user = await this.prisma.operativeUser.create({
      data: {
        fullName: dto.fullName,
        emailAddress: dto.email,
        username: dto.username,
        password: hashedPassword,
        enabled: true,
        createdById,
      },
      select: {
        id: true,
        fullName: true,
        emailAddress: true,
        username: true,
        enabled: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return user as SafeOperativeUser;
  }

  async update(id: string, dto: UpdateOperativeUserDto): Promise<SafeOperativeUser> {
    await this.findById(id);

    // Verificar duplicados si cambia email o username
    if (dto.email) {
      const exists = await this.prisma.operativeUser.count({
        where: { emailAddress: dto.email, deletedAt: null, id: { not: id } },
      });
      if (exists > 0) {
        throw new ConflictException('An operative user with this email already exists');
      }
    }

    if (dto.username) {
      const exists = await this.prisma.operativeUser.count({
        where: { username: dto.username, deletedAt: null, id: { not: id } },
      });
      if (exists > 0) {
        throw new ConflictException('An operative user with this username already exists');
      }
    }

    const user = await this.prisma.operativeUser.update({
      where: { id },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.email !== undefined && { emailAddress: dto.email }),
        ...(dto.username !== undefined && { username: dto.username }),
      },
      select: {
        id: true,
        fullName: true,
        emailAddress: true,
        username: true,
        enabled: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return user as SafeOperativeUser;
  }

  async toggleStatus(id: string, enable: boolean): Promise<SafeOperativeUser> {
    await this.findById(id);

    const user = await this.prisma.operativeUser.update({
      where: { id },
      data: { enabled: enable },
      select: {
        id: true,
        fullName: true,
        emailAddress: true,
        username: true,
        enabled: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    return user as SafeOperativeUser;
  }

  async softDelete(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.operativeUser.update({
      where: { id },
      data: { deletedAt: new Date(), enabled: false },
    });
  }

  async changePassword(id: string, newPassword: string): Promise<void> {
    await this.findById(id);

    const hashedPassword = await this.passwordHasher.hash(newPassword);

    await this.prisma.operativeUser.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}

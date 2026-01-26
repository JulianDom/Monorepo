import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@infra/security/authentication';
import { RolesGuard } from '@presentation/guards';
import { Roles } from '@presentation/guards/decorators';
import { ActorType } from '@shared/types';
import {
  GetAdminProfileUseCase,
  UpdateAdminProfileUseCase,
  ChangeAdminPasswordUseCase,
  ListAdministratorsUseCase,
  GetAdministratorUseCase,
  CreateAdministratorUseCase,
  UpdateAdministratorUseCase,
  ToggleAdministratorStatusUseCase,
  RequestPasswordRecoveryUseCase,
  ResetPasswordUseCase,
} from '@core/application/use-cases/administrators';
import {
  PaginationQueryDto,
  AdminProfileResponseDto,
  UpdateAdminProfileDto,
  ChangePasswordDto,
  CreateAdministratorDto,
  UpdateAdministratorDto,
  ToggleStatusDto,
  RequestPasswordRecoveryDto,
  ResetPasswordDto,
  PasswordRecoveryResponseDto,
  AdministratorResponseDto,
  AdministratorDetailResponseDto,
  AdministratorListResponseDto,
} from './dto';

/**
 * AdministratorsController
 *
 * Épica 4: Gestión de Usuario (Administrador)
 * - Login, recuperación de contraseña y gestión de perfil
 * - Autogestión de administradores (alta, edición, habilitar/deshabilitar)
 */
@ApiTags('administrators')
@Controller('administrators')
export class AdministratorsController {
  constructor(
    private readonly getAdminProfileUseCase: GetAdminProfileUseCase,
    private readonly updateAdminProfileUseCase: UpdateAdminProfileUseCase,
    private readonly changeAdminPasswordUseCase: ChangeAdminPasswordUseCase,
    private readonly listAdministratorsUseCase: ListAdministratorsUseCase,
    private readonly getAdministratorUseCase: GetAdministratorUseCase,
    private readonly createAdministratorUseCase: CreateAdministratorUseCase,
    private readonly updateAdministratorUseCase: UpdateAdministratorUseCase,
    private readonly toggleAdministratorStatusUseCase: ToggleAdministratorStatusUseCase,
    private readonly requestPasswordRecoveryUseCase: RequestPasswordRecoveryUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  // ==================== Profile Management ====================

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved', type: AdminProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async getProfile(@Request() req: any): Promise<AdminProfileResponseDto> {
    return this.getAdminProfileUseCase.execute(req.user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current admin profile' })
  @ApiBody({ type: UpdateAdminProfileDto })
  @ApiResponse({ status: 200, description: 'Profile updated', type: AdministratorResponseDto })
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateAdminProfileDto,
  ): Promise<AdministratorResponseDto> {
    return this.updateAdminProfileUseCase.execute({
      adminId: req.user.sub,
      fullName: dto.fullName,
    });
  }

  @Post('profile/change-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change current admin password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 204, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto): Promise<void> {
    await this.changeAdminPasswordUseCase.execute({
      adminId: req.user.sub,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
  }

  // ==================== Password Recovery (Public) ====================

  @Post('password-recovery/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password recovery email' })
  @ApiBody({ type: RequestPasswordRecoveryDto })
  @ApiResponse({ status: 200, description: 'Recovery email sent', type: PasswordRecoveryResponseDto })
  async requestPasswordRecovery(
    @Body() dto: RequestPasswordRecoveryDto,
  ): Promise<PasswordRecoveryResponseDto> {
    return this.requestPasswordRecoveryUseCase.execute({ email: dto.email });
  }

  @Post('password-recovery/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reset password using recovery ID' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 204, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired recovery ID' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.resetPasswordUseCase.execute({
      recoveryId: dto.recoveryId,
      newPassword: dto.newPassword,
    });
  }

  // ==================== Administrator CRUD ====================

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all administrators' })
  @ApiResponse({ status: 200, description: 'List of administrators', type: AdministratorListResponseDto })
  async listAdministrators(
    @Query() query: PaginationQueryDto,
  ): Promise<AdministratorListResponseDto> {
    return this.listAdministratorsUseCase.execute({
      page: query.page,
      limit: query.limit,
      enabledOnly: query.enabledOnly,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get administrator by ID' })
  @ApiParam({ name: 'id', description: 'Administrator ID' })
  @ApiResponse({ status: 200, description: 'Administrator details', type: AdministratorDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Administrator not found' })
  async getAdministrator(@Param('id') id: string): Promise<AdministratorDetailResponseDto> {
    return this.getAdministratorUseCase.execute(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new administrator' })
  @ApiBody({ type: CreateAdministratorDto })
  @ApiResponse({ status: 201, description: 'Administrator created', type: AdministratorResponseDto })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async createAdministrator(
    @Body() dto: CreateAdministratorDto,
  ): Promise<AdministratorResponseDto> {
    return this.createAdministratorUseCase.execute({
      fullName: dto.fullName,
      email: dto.email,
      username: dto.username,
      password: dto.password,
      modules: dto.modules,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an administrator' })
  @ApiParam({ name: 'id', description: 'Administrator ID' })
  @ApiBody({ type: UpdateAdministratorDto })
  @ApiResponse({ status: 200, description: 'Administrator updated', type: AdministratorDetailResponseDto })
  @ApiResponse({ status: 404, description: 'Administrator not found' })
  async updateAdministrator(
    @Param('id') id: string,
    @Body() dto: UpdateAdministratorDto,
  ): Promise<AdministratorDetailResponseDto> {
    return this.updateAdministratorUseCase.execute({
      adminId: id,
      fullName: dto.fullName,
      modules: dto.modules,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Enable or disable an administrator' })
  @ApiParam({ name: 'id', description: 'Administrator ID' })
  @ApiBody({ type: ToggleStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated', type: AdministratorResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot disable your own account' })
  @ApiResponse({ status: 404, description: 'Administrator not found' })
  async toggleStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ToggleStatusDto,
  ): Promise<AdministratorResponseDto> {
    return this.toggleAdministratorStatusUseCase.execute({
      adminId: id,
      enable: dto.enable,
      requestingAdminId: req.user.sub,
    });
  }
}

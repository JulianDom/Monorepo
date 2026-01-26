import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginUseCase, RegisterUseCase, RefreshTokenUseCase, LogoutUseCase } from '@core/application/use-cases/auth';
import { ActorType } from '@shared/types';
import { LoginDto, RegisterUserDto, RegisterAdminDto, AuthResponseDto, RefreshTokenDto, LogoutDto } from './dto';
import { JwtAuthGuard } from '@infra/security/authentication';
import { RolesGuard } from '@presentation/guards';
import { Roles } from '@presentation/guards/decorators';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    type: ActorType;
  };
}

/**
 * AuthController
 *
 * Controller para autenticación.
 * Solo orquesta - la lógica de negocio está en los Use Cases.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login for users and administrators' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
      actorType: dto.actorType,
    });

    return {
      actor: result.actor,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async registerUser(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    const result = await this.registerUseCase.registerUser({
      fullName: dto.fullName,
      email: dto.email,
      username: dto.username,
      password: dto.password,
      language: dto.language,
    });

    return {
      actor: result.actor,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    };
  }

  @Post('register/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ActorType.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register a new administrator (requires ADMIN role)' })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({ status: 201, description: 'Administrator registered successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async registerAdmin(@Body() dto: RegisterAdminDto): Promise<AuthResponseDto> {
    const result = await this.registerUseCase.registerAdmin({
      fullName: dto.fullName,
      email: dto.email,
      username: dto.username,
      password: dto.password,
    });

    return {
      actor: result.actor,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    const result = await this.refreshTokenUseCase.execute({
      refreshToken: dto.refreshToken,
      actorType: undefined, // Dejar que el use case determine el tipo desde el token
    });

    return {
      actor: result.actor,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async logout(@Req() req: AuthenticatedRequest, @Body() dto: LogoutDto) {
    if (!req.user?.type || !req.user?.id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const result = await this.logoutUseCase.execute({
      userId: req.user.id,
      actorType: req.user.type,
      allSessions: dto.allSessions,
    });

    return {
      message: result.message,
      sessionsInvalidated: result.sessionsInvalidated,
    };
  }
}

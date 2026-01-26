import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

/**
 * Refresh Token DTO
 */
export class RefreshTokenDto {
    @ApiProperty({
        description: 'Refresh token to generate new access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    @IsNotEmpty()
    public refreshToken!: string;

    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
    }
}

/**
 * Logout DTO
 */
export class LogoutDto {
    @ApiProperty({
        description: 'Optional: Invalidate all user sessions',
        example: false,
        required: false,
    })
    @IsBoolean()
    public allSessions?: boolean;

    constructor(allSessions?: boolean) {
        this.allSessions = allSessions;
    }
}

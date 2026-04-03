import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
        };
    }>;
    refresh(rawRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, rawRefreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getProfile(userId: string): Promise<{
        email: string;
        name: string | null;
        id: string;
        plan: import("@prisma/client").$Enums.Plan;
        createdAt: Date;
    } | null>;
    private generateAccessToken;
    private generateRefreshToken;
    private hashToken;
    private computeExpiryDate;
}

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SubscriptionService } from '../billing/subscription.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private subscriptionService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, subscriptionService: SubscriptionService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: import("../billing/subscription.service").UserSubscriptionProfile;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: import("../billing/subscription.service").UserSubscriptionProfile;
    }>;
    refresh(rawRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, rawRefreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getProfile(userId: string): Promise<import("../billing/subscription.service").UserSubscriptionProfile>;
    private generateAccessToken;
    private generateRefreshToken;
    private hashToken;
    private computeExpiryDate;
}

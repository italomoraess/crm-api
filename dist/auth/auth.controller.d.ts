import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: {
        userId: string;
    }, dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    logoutAll(user: {
        userId: string;
    }): Promise<{
        message: string;
    }>;
    me(user: {
        userId: string;
    }): Promise<import("../billing/subscription.service").UserSubscriptionProfile>;
    updateMe(user: {
        userId: string;
    }, dto: UpdateProfileDto): Promise<import("../billing/subscription.service").UserSubscriptionProfile>;
}

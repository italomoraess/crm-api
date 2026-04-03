import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    }): Promise<{
        email: string;
        name: string | null;
        id: string;
        plan: import("@prisma/client").$Enums.Plan;
        createdAt: Date;
    } | null>;
}

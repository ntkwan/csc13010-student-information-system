import {
    Body,
    Controller,
    HttpCode,
    Post,
    UseGuards,
    Request,
    Res,
    Get,
    Param,
    Put,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ATAuthGuard } from './guards/at-auth.guard';
import { RTAuthGuard } from './guards/rt-auth.guard';
import {
    ApiResponse,
    ApiOperation,
    ApiBody,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { TokensEntity } from './entities/tokens.entity';
import { CredEntity } from './entities/creds.entity';
import { AuthLoginDto } from './dtos/auth-login.dto';
import { AuthSignUpDto } from './dtos/auth-signup.dto';
import {
    ForgotPasswordDto,
    ResetPasswordDto,
    VerifyOtpDto,
} from './dtos/auth-psw-recovery.dto';
import { ChangeRoleDto } from './dtos/change-role.dto';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from './enums/roles.enum';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({
        summary: 'Login using credentials. Provide email in username field',
    })
    @ApiBody({ type: AuthLoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: TokensEntity,
    })
    @HttpCode(200)
    @Post('sign-in')
    async signIn(@Request() req: any, @Res() res: Response): Promise<void> {
        const { refreshToken, accessToken } = await this.authService.signIn(
            req.body,
        );
        res.cookie('refresh_token', refreshToken, { httpOnly: true });
        res.send({
            accessToken,
            refreshToken,
            message: 'User has been signed in successfully',
        });
    }

    @ApiOperation({ summary: 'Sign-up to login' })
    @ApiBody({ type: AuthSignUpDto })
    @ApiResponse({
        status: 200,
        description: 'Sign-up successful',
        type: CredEntity,
    })
    @Post('sign-up')
    @HttpCode(200)
    async signUp(
        @Body() req: AuthSignUpDto,
        @Res() res: Response,
    ): Promise<void> {
        const newUser = await this.authService.signUp(req);
        res.send({
            newUser,
            message: 'User has been created successfully',
        });
    }

    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Sign-out and clear credentials' })
    @ApiResponse({
        status: 200,
        description: 'Sign-out successful',
    })
    @Post('sign-out')
    @UseGuards(ATAuthGuard)
    @HttpCode(200)
    async signOut(@Request() req: any, @Res() res: Response): Promise<void> {
        await this.authService.logOut(req.user);
        res.clearCookie('refresh_token');
        res.send({
            message: 'User has been signed out successfully',
        });
    }

    @ApiBearerAuth('refresh-token')
    @ApiOperation({
        summary:
            'Refresh tokens with credentials. Provide refresh token, not access token to the field',
    })
    @Get('refresh-token')
    @UseGuards(RTAuthGuard)
    @ApiResponse({
        status: 200,
        description: 'Refresh tokens successfully',
        type: TokensEntity,
    })
    @HttpCode(200)
    async refreshToken(
        @Request() req: any,
        @Res() res: Response,
    ): Promise<void> {
        const id = req.user.id;
        const oldRefreshToken = req
            .get('Authorization')
            .replace('Bearer', '')
            .trim();

        const { refreshToken, accessToken } =
            await this.authService.getNewTokens(id, oldRefreshToken);
        res.cookie('refresh_token', refreshToken, { httpOnly: true });

        res.send({
            accessToken,
            message: 'Token has been refreshed successfully',
        });
    }

    @ApiOperation({ summary: 'Password recovery' })
    @Post('password-recovery')
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Send OTP successfully via email',
    })
    @HttpCode(200)
    async forgotPassword(
        @Request() req: any,
        @Res() res: Response,
    ): Promise<void> {
        await this.authService.forgotPassword(req.body.email);
        res.send({
            message: 'Password recovery email has been sent successfully',
        });
    }

    @ApiOperation({ summary: 'Verify OTP' })
    @Post('verify-otp')
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({
        status: 200,
        description: 'OTP verified successfully',
    })
    @HttpCode(200)
    async verifyOtp(
        @Request() req: any,
        @Res() res: Response,
    ): Promise<void> {
        const email = req.body.email;
        const otp = req.body.otp;
        await this.authService.verifyOtp(email, otp);
        res.send({
            message: 'OTP has been verified successfully',
        });
    }

    @ApiOperation({ summary: 'Reset password' })
    @Post('reset-password')
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Reset password successfully',
    })
    @HttpCode(200)
    async resetPassword(
        @Request() req: any,
        @Res() res: Response,
    ): Promise<void> {
        const email = req.body.email;
        const otp = req.body.otp;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        await this.authService.resetPassword(
            email,
            otp,
            newPassword,
            confirmPassword,
        );
        res.send({
            message: 'Password has been reset successfully',
        });
    }

    @ApiBearerAuth('access-token')
    @ApiOperation({
        summary:
            'Change user role by ID [ADMIN]. There are 2 roles: administrator (ADMIN), user (USER). Cannot change role to ADMIN',
    })
    @Put('change-role/:id')
    @ApiBody({ type: ChangeRoleDto })
    @ApiResponse({
        status: 200,
        description: 'User role changed successfully',
    })
    @HttpCode(200)
    @UseGuards(ATAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async changeRole(
        @Param('id') id: string,
        @Request() req: any,
        @Res() res: Response,
    ): Promise<void> {
        const role = req.body.role;
        if (role !== Role.ADMIN && role !== Role.USER) {
            res.send({
                statusCode: 404,
                message: 'Role is not valid',
            });
        }

        if (role === Role.ADMIN) {
            res.send({
                statusCode: 404,
                message: 'Cannot change role to ADMIN',
            });
        }

        await this.authService.changeRole(req.user, id, role);
        res.send({
            statusCode: 200,
            message: 'User role has been changed successfully',
        });
    }
}

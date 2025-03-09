import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ATAuthGuard } from './guards/at-auth.guard';
import { RTAuthGuard } from './guards/rt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: Record<string, jest.Mock>;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        signIn: jest.fn(),
                        logOut: jest.fn(),
                        getNewTokens: jest.fn(),
                        forgotPassword: jest.fn(),
                        verifyOtp: jest.fn(),
                        resetPassword: jest.fn(),
                        changeRole: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(ATAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RTAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
    });

    describe('signIn', () => {
        it('should sign in a user, set refresh token cookie, and send tokens with success message', async () => {
            const tokens = { accessToken: 'access', refreshToken: 'refresh' };
            authService.signIn.mockResolvedValue(tokens);

            const req = {
                body: {
                    username: 'user',
                    password: 'pass',
                    email: 'user@example.com',
                },
            };
            const res = {
                cookie: jest.fn(),
                send: jest.fn(),
            } as any;

            await authController.signIn(req, res);

            expect(authService.signIn).toHaveBeenCalledWith(req.body);
            expect(res.cookie).toHaveBeenCalledWith(
                'refresh_token',
                tokens.refreshToken,
                { httpOnly: true },
            );
            expect(res.send).toHaveBeenCalledWith({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                message: 'User has been signed in successfully',
            });
        });
    });

    describe('signOut', () => {
        it('should sign out a user, clear the refresh token cookie, and send a success message', async () => {
            authService.logOut.mockResolvedValue(null);
            const req = { user: { id: '123' } };
            const res = {
                clearCookie: jest.fn(),
                send: jest.fn(),
            } as any;

            await authController.signOut(req, res);

            expect(authService.logOut).toHaveBeenCalledWith(req.user);
            expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
            expect(res.send).toHaveBeenCalledWith({
                message: 'User has been signed out successfully',
            });
        });
    });

    describe('refreshToken', () => {
        it('should refresh tokens, set a new refresh token cookie, and send the new access token with a success message', async () => {
            const tokens = {
                accessToken: 'newAccess',
                refreshToken: 'newRefresh',
            };
            authService.getNewTokens.mockResolvedValue(tokens);
            const req = {
                user: { id: '123' },
                get: jest.fn().mockReturnValue('Bearer oldRefresh'),
            };
            const res = {
                cookie: jest.fn(),
                send: jest.fn(),
            } as any;

            await authController.refreshToken(req, res);

            expect(req.get).toHaveBeenCalledWith('Authorization');
            expect(authService.getNewTokens).toHaveBeenCalledWith(
                '123',
                'oldRefresh',
            );
            expect(res.cookie).toHaveBeenCalledWith(
                'refresh_token',
                tokens.refreshToken,
                { httpOnly: true },
            );
            expect(res.send).toHaveBeenCalledWith({
                accessToken: tokens.accessToken,
                message: 'Token has been refreshed successfully',
            });
        });
    });

    describe('forgotPassword', () => {
        it('should trigger password recovery and send a success message', async () => {
            authService.forgotPassword.mockResolvedValue(null);
            const req = { body: { email: 'user@example.com' } };
            const res = { send: jest.fn() } as any;

            await authController.forgotPassword(req, res);

            expect(authService.forgotPassword).toHaveBeenCalledWith(
                'user@example.com',
            );
            expect(res.send).toHaveBeenCalledWith({
                message: 'Password recovery email has been sent successfully',
            });
        });
    });

    describe('verifyOtp', () => {
        it('should verify OTP and send a success message', async () => {
            authService.verifyOtp.mockResolvedValue(null);
            const req = { body: { email: 'user@example.com', otp: '123456' } };
            const res = { send: jest.fn() } as any;

            await authController.verifyOtp(req, res);

            expect(authService.verifyOtp).toHaveBeenCalledWith(
                'user@example.com',
                '123456',
            );
            expect(res.send).toHaveBeenCalledWith({
                message: 'OTP has been verified successfully',
            });
        });
    });

    describe('resetPassword', () => {
        it('should reset the password and send a success message', async () => {
            authService.resetPassword.mockResolvedValue(null);
            const req = {
                body: {
                    email: 'user@example.com',
                    otp: '123456',
                    newPassword: 'newPass',
                    confirmPassword: 'newPass',
                },
            };
            const res = { send: jest.fn() } as any;

            await authController.resetPassword(req, res);

            expect(authService.resetPassword).toHaveBeenCalledWith(
                'user@example.com',
                '123456',
                'newPass',
                'newPass',
            );
            expect(res.send).toHaveBeenCalledWith({
                message: 'Password has been reset successfully',
            });
        });
    });
});

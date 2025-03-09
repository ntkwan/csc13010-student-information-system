import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import {
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Role } from './enums/roles.enum';
import { User } from '../../src/user/entities/user.entity';
import { UserRepository } from '../user/repositories/user.repository';

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;
    let mailerService: MailerService;
    let userRepository: UserRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        findByEmail: jest.fn(),
                        validatePassword: jest.fn(),
                        updateRefreshToken: jest.fn(),
                        updateOtp: jest.fn(),
                        create: jest.fn(),
                        findById: jest.fn(),
                        updatePassword: jest.fn(),
                        findByOtpOnly: jest.fn(),
                        updateRole: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue('test-secret'),
                    },
                },
                {
                    provide: MailerService,
                    useValue: {
                        sendMail: jest.fn(),
                    },
                },
                {
                    provide: UserRepository,
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        mailerService = module.get<MailerService>(MailerService);
        userRepository = module.get<UserRepository>(UserRepository);
    });

    describe('signIn', () => {
        it('should throw NotFoundException if user is not provided', async () => {
            await expect(
                authService.signIn({
                    username: '',
                    password: '',
                    email: '',
                }),
            ).rejects.toThrow(NotFoundException);
        });
        it('should throw NotFoundException if user is not found', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(
                authService.signIn({
                    password: '123',
                    username: 'ntquan222@clc.fitus.edu.vn',
                    email: 'ntquan222@clc.fitus.edu.vn',
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue({
                username: 'ntquan222@clc.fitus.edu.vn',
                email: '',
                password: '123',
            } as unknown as User);

            jest.spyOn(userService, 'validatePassword').mockResolvedValue(
                false,
            );

            await expect(
                authService.signIn({
                    username: '22127001',
                    password: '123',
                    email: 'ntquan222@clc.fitus.edu.vn',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw BadRequestException if user role is STUDENT or TEACHER', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue({
                username: '18125222',
                email: 'tvf18@student.university.edu.vn',
                role: Role.STUDENT, // Include role property
            } as unknown as User);

            jest.spyOn(userService, 'validatePassword').mockResolvedValue(true);

            await expect(
                authService.signIn({
                    username: '18125222',
                    password: '1234',
                    email: 'tvf18@student.university.edu.vn',
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('logOut', () => {
        it('should call updateRefreshToken with null', () => {
            jest.spyOn(userService, 'updateRefreshToken').mockResolvedValue(
                null,
            );

            authService.logOut({
                username: 'admin',
                email: 'admin@server.com',
                password: 'admin',
            } as unknown as User);

            expect(userService.updateRefreshToken).toHaveBeenCalledWith(
                'admin',
                null,
            );
        });
    });

    describe('forgotPassword', () => {
        it('should throw NotFoundException if user is not found', async () => {
            jest.spyOn(userRepository, 'find').mockResolvedValue(null);

            await expect(
                authService.forgotPassword('test@example.com'),
            ).rejects.toThrow(InternalServerErrorException);
        });

        it('should send an email with OTP', async () => {
            jest.spyOn(userRepository, 'find').mockResolvedValue({
                id: '1',
                username: 'test',
                email: 'test@example.com',
                password: 'dummy-password',
                refreshToken: '',
                otp: '',
                role: Role.ADMIN,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as unknown as User);
            jest.spyOn(userService, 'updateOtp').mockResolvedValue(null);
            jest.spyOn(mailerService, 'sendMail').mockResolvedValue(null);

            await authService.forgotPassword('test@example.com');

            expect(userService.updateOtp).toHaveBeenCalled();
            expect(mailerService.sendMail).toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        let authService: AuthService;
        let userService: UserService;
        let userRepository: UserRepository;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    AuthService,
                    {
                        provide: JwtService,
                        useValue: {
                            signAsync: jest.fn(),
                        },
                    },
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn().mockReturnValue('test-secret'),
                        },
                    },
                    {
                        provide: MailerService,
                        useValue: {
                            sendMail: jest.fn(),
                        },
                    },
                    {
                        provide: UserService,
                        useValue: {
                            findByOtpOnly: jest.fn(),
                            updatePassword: jest.fn(),
                        },
                    },
                    {
                        provide: UserRepository,
                        useValue: {
                            find: jest.fn(),
                        },
                    },
                ],
            }).compile();

            authService = module.get<AuthService>(AuthService);
            userService = module.get<UserService>(UserService);
            userRepository = module.get<UserRepository>(UserRepository);
        });

        it('should throw an error if OTP is invalid', async () => {
            // Simulate no user found for the given OTP
            jest.spyOn(userRepository, 'find').mockResolvedValue(null);

            await expect(
                authService.resetPassword(
                    'test@example.com',
                    '123456',
                    'newPass',
                    'newPass',
                ),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw an error if passwords do not match', async () => {
            // Return a valid user with a future otpExpiry
            const validUser = {
                otpExpiry: new Date(Date.now() + 10000),
            } as unknown as User;
            jest.spyOn(userRepository, 'find').mockResolvedValue(validUser);

            await expect(
                authService.resetPassword(
                    'test@example.com',
                    '123456',
                    'newPass',
                    'wrongPass',
                ),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw an error if OTP is expired', async () => {
            // Return a user with an otpExpiry in the past
            const expiredUser = {
                otpExpiry: new Date(Date.now() - 10000),
            } as unknown as User;
            jest.spyOn(userRepository, 'find').mockResolvedValue(expiredUser);

            await expect(
                authService.resetPassword(
                    'test@example.com',
                    '123456',
                    'newPass',
                    'newPass',
                ),
            ).rejects.toThrow(NotFoundException);
        });

        it('should update the password successfully if valid', async () => {
            // Return a user with a valid (future) otpExpiry and matching passwords
            const validUser = {
                otpExpiry: new Date(Date.now() + 10000),
            } as unknown as User;
            jest.spyOn(userRepository, 'find').mockResolvedValue(validUser);
            const updatePasswordSpy = jest
                .spyOn(userService, 'updatePassword')
                .mockResolvedValue(null);

            await expect(
                authService.resetPassword(
                    'test@example.com',
                    '123456',
                    'newPass',
                    'newPass',
                ),
            ).resolves.toBeUndefined();

            expect(updatePasswordSpy).toHaveBeenCalledWith(
                'test@example.com',
                'newPass',
            );
        });
    });
});

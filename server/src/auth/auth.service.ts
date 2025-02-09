import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { UserSignUpDto } from '../user/dtos/user-signup.dto';
import { UserLoginDto } from '../user/dtos/user-login.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { Role } from './enums/roles.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {}

    public async signIn(user: UserLoginDto): Promise<any> {
        try {
            if (!user) {
                throw new BadRequestException('Invalid credentials');
            }

            const foundUser = await this.usersService.findByEmail(
                user.username || user.email,
            );
            if (!foundUser) {
                throw new NotFoundException('User not found');
            }

            const isValidPassword: boolean =
                await this.usersService.validatePassword(
                    user.password,
                    foundUser,
                );

            if (!isValidPassword) {
                throw new UnauthorizedException('Wrong password');
            }

            if (
                foundUser.role === Role.STUDENT ||
                foundUser.role === Role.TEACHER
            ) {
                throw new UnauthorizedException(
                    'User has no permission to access this resource, this is for admins only',
                );
            }

            const payloadAccessToken = {
                id: foundUser.id,
                username: foundUser.username,
                role: foundUser.role,
            };

            const accessToken = await this.jwtService.signAsync(
                payloadAccessToken,
                {
                    secret: this.configService.get('AT_SECRET'),
                    expiresIn: '1h',
                },
            );

            const payloadRefreshToken = {
                sub: foundUser.id,
                email: foundUser.email,
                role: foundUser.role,
            };

            const refreshToken = await this.jwtService.signAsync(
                payloadRefreshToken,
                {
                    secret: this.configService.get('RT_SECRET'),
                    expiresIn: '7d',
                },
            );

            await this.usersService.updateRefreshToken(
                foundUser.id,
                refreshToken,
            );
            await this.usersService.updateOtp(foundUser.id, null, null);

            return {
                refreshToken,
                accessToken,
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    public async signUp(user: UserSignUpDto): Promise<User> {
        try {
            const newUser = await this.usersService.create(user);
            return newUser;
        } catch (error) {
            console.log(error.message);
            throw new InternalServerErrorException(
                'Error signing up',
                error.message,
            );
        }
    }

    public async logOut(user: any): Promise<void> {
        try {
            await this.usersService.updateRefreshToken(user.id, null);
        } catch (error) {
            throw new InternalServerErrorException('Error logging out', {
                cause: error.message,
            });
        }
    }

    public async getNewTokens(id: string, refreshToken: string): Promise<any> {
        try {
            const user = await this.usersService.findById(id);
            if (!user) {
                throw new BadRequestException('User not found');
            }

            if (user.refreshToken !== refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }
            const payloadAccessToken = {
                id: user.id,
                email: user.username,
                role: user.role,
            };

            const newAT = await this.jwtService.signAsync(payloadAccessToken, {
                secret: this.configService.get('AT_SECRET'),
                expiresIn: '12h',
            });

            const payloadRefreshToken = {
                sub: user.id,
                username: user.email,
                role: user.role,
            };

            const newRT = await this.jwtService.signAsync(payloadRefreshToken, {
                secret: this.configService.get('RT_SECRET'),
                expiresIn: '7d',
            });

            await this.usersService.updateRefreshToken(user.id, newRT);

            return {
                refreshToken: newRT,
                accessToken: newAT,
            };
        } catch (error) {
            throw new InternalServerErrorException('Error refreshing token', {
                cause: error.message,
            });
        }
    }

    public async forgotPassword(email: string): Promise<void> {
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) throw new NotFoundException('User not found');

            const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
            const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

            await this.usersService.updateOtp(email, otp, otpExpiry);

            await this.mailerService.sendMail({
                to: email,
                subject: '[NO-REPLY] Reset Password OTP',
                text: `Please do not reply this message. \n Your OTP is: ${otp}`,
            });

            return;
        } catch (error) {
            throw new InternalServerErrorException(error.message, {
                cause: error.message,
            });
        }
    }

    async hashPassword(password: string): Promise<string> {
        try {
            const salt: number = await bcrypt.genSalt(
                parseInt(this.configService.get('SALT'), 10),
            );

            const hashedPassword: string = await bcrypt.hash(password, salt);

            return hashedPassword;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async verifyOtp(email: string, otp: string): Promise<void> {
        try {
            const user = await this.usersService.findByOtpOnly(email, otp);

            if (!user) throw new BadRequestException('Invalid OTP');

            const currentTime = new Date();
            if (currentTime > user.otpExpiry) {
                throw new BadRequestException('OTP expired');
            }

            return;
        } catch (error) {
            throw new InternalServerErrorException(error.message, {
                cause: error.message,
            });
        }
    }

    async resetPassword(
        email: string,
        otp: string,
        newPassword: string,
        confirmPassword: string,
    ): Promise<void> {
        try {
            const user = await this.usersService.findByOtpOnly(email, otp);

            if (!user) throw new BadRequestException('Invalid OTP');

            console.log(newPassword, confirmPassword);
            if (newPassword !== confirmPassword) {
                throw new BadRequestException('Passwords do not match');
            }

            const currentTime = new Date();
            if (currentTime > user.otpExpiry) {
                throw new BadRequestException('OTP expired');
            }

            await this.usersService.updatePassword(email, newPassword);
            return;
        } catch (error) {
            throw new InternalServerErrorException(error.message, {
                cause: error.message,
            });
        }
    }

    async changeRole(user: User, id: string, role: string): Promise<void> {
        try {
            if (user.id === id) {
                throw new BadRequestException('Cannot change your own role');
            }

            await this.usersService.updateRole(id, role);
        } catch (error) {
            console.log(error.message);
            throw new InternalServerErrorException(error.message);
        }
    }
}

import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Role } from '../auth/enums/roles.enum';
import { UpdateUsersDto } from './dtos/user-update.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        private configService: ConfigService,
    ) {}

    async getMyProfile(profileUser: User): Promise<any> {
        try {
            const { id } = profileUser;
            const user = await this.userModel.findById(id).exec();

            if (!user) {
                throw new BadRequestException('User not found');
            }

            const newUser = {
                email: user.email,
                username: user.username,
                id: user.id,
            };
            return newUser;
        } catch (error) {
            throw new InternalServerErrorException(
                'Error getting profile',
                error.message,
            );
        }
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findByOtp(
        email: string,
        otp: string,
        otpExpiry: Date,
    ): Promise<User> {
        const user: User = await this.userModel
            .findOne({ email, otp, otpExpiry })
            .exec();

        if (!user) {
            throw new InternalServerErrorException(
                `User with email: ${email} not found`,
            );
        }
        return user;
    }

    async findByOtpOnly(email: string, otp: string): Promise<User> {
        const user: User = await this.userModel
            .findOne({ email: email, otp: otp })
            .exec();
        if (!user) {
            throw new InternalServerErrorException(`User ${email} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new InternalServerErrorException(`User ${email} not found`);
        }
        return user;
    }

    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new InternalServerErrorException(
                `User with id ${id} not found`,
            );
        }
        return user;
    }

    async validatePassword(password: string, user: User): Promise<boolean> {
        try {
            console.log(
                password,
                user.password,
                await bcrypt.compare(password, user.password),
            );
            return await bcrypt.compare(password, user.password);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
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

    async create(userSignUpDto: UserSignUpDto): Promise<User> {
        const { username, email, password, birthdate } = userSignUpDto;
        const hashedPassword = await this.hashPassword(password);

        const user = await this.userModel.create({
            username: username,
            email: email,
            password: hashedPassword,
            birthdate: new Date(birthdate),
            otp: null,
            otpExpiry: null,
            role: Role.USER,
        });
        if (!user) {
            throw new InternalServerErrorException(
                'This email or username is already in use',
            );
        }
        return user;
    }

    async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
        try {
            await this.userModel
                .findOneAndUpdate({ _id: id }, { refreshToken })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateOtp(
        email: string,
        otp: string,
        otpExpiry: Date,
    ): Promise<void> {
        try {
            await this.userModel
                .findOneAndUpdate({ email }, { otp, otpExpiry })
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updatePassword(email: string, password: string): Promise<void> {
        try {
            const hashedPassword = await this.hashPassword(password);
            await this.userModel
                .findOneAndUpdate(
                    { email: email },
                    { password: hashedPassword, otp: null, otpExpiry: null },
                )
                .exec();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async removeById(id: string): Promise<void> {
        const result = await this.userModel.findByIdAndDelete(id).exec();

        if (!result) {
            throw new InternalServerErrorException(
                `User with id ${id} not found`,
            );
        }
    }

    async createDefaultAdmin() {
        try {
            const adminExists = await this.userModel
                .findOne({
                    role: Role.ADMIN,
                })
                .exec();

            if (adminExists === null) {
                const adminPassword: string =
                    this.configService.get('ADMIN_PASSWORD');
                const hashedPassword = await this.hashPassword(adminPassword);
                const admin = await this.userModel.create({
                    username: this.configService.get('ADMIN_USERNAME'),
                    email: this.configService.get('ADMIN_EMAIL'),
                    password: hashedPassword,
                    role: Role.ADMIN,
                    birthdate: new Date(),
                });

                console.log('Admin account created successfully', admin);
            } else {
                console.log('Admin account already exists');
            }
        } catch (error) {
            console.log(
                'Error creating default admin account: ',
                error.message,
            );
        }
    }

    async searchByNameOrEmail(name: string): Promise<User[]> {
        const regex = new RegExp(name, 'i'); // Case-insensitive regex search
        const users = await this.userModel.find({
            $or: [{ username: regex }, { email: regex }],
        });

        if (!users.length) {
            throw new NotFoundException('No users found matching the criteria');
        }

        return users;
    }

    async updateRole(id: string, role: string): Promise<void> {
        try {
            const user = await this.userModel.findById(id).exec();

            if (user.role === role) {
                throw new InternalServerErrorException(
                    'User already has this role',
                );
            }

            await this.userModel.findOneAndUpdate({ _id: id }, { role }).exec();
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateMultipleUsers(records: UpdateUsersDto[]) {
        const results = [];

        for (const { id, updates } of records) {
            const user = await this.userModel.findById(id).exec();
            if (!user) {
                throw new NotFoundException(`User with id ${id} not found`);
            }

            try {
                Object.assign(user, updates);
                await user.save();
                results.push({
                    id: user._id,
                    status: 'updated',
                });
            } catch (error) {
                results.push({
                    id,
                    status: 'error',
                    message: error.message,
                });
            }
        }

        return results;
    }
}

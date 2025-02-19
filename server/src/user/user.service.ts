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
import { Status } from './enums/student.enum';

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

            const userProfile = {
                username: user.username,
                fullname: user.fullname,
                birthday: user.birthday
                    ? user.birthday.toISOString().split('T')[0]
                    : null,
                gender: user.gender,
                faculty: user.faculty,
                classYear: user.classYear,
                program: user.program,
                address: user.address ? user.address : null,
                email: user.email,
                phone: user.phone ? user.phone : null,
                status: user.status,
                id: user.id,
                role: user.role,
            };
            return userProfile;
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
        try {
            const {
                username,
                fullname,
                birthday,
                gender,
                faculty,
                classYear,
                program,
                address,
                email,
                password,
                phone,
            } = userSignUpDto;
            const hashedPassword = await this.hashPassword(password);
            const user = await this.userModel.create({
                username: username,
                email: email,
                password: hashedPassword,
                birthday: new Date(birthday),
                fullname: fullname,
                gender: gender,
                faculty: faculty,
                classYear: classYear,
                program: program,
                address: address,
                phone: phone,
                status: Status.ACTIVE,
                otp: null,
                otpExpiry: null,
                role: Role.STUDENT,
            });

            if (!user) {
                throw new InternalServerErrorException(
                    'This email or username is already in use',
                );
            }
            return user;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
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

    async removeByStudentId(id: string): Promise<void> {
        const result = await this.userModel
            .findOneAndDelete({ username: id })
            .exec();

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
                    birthday: new Date(),
                    fullname: this.configService.get('ADMIN_FULLNAME'),
                    address: 'address',
                    phone: '0123456789',
                    otp: null,
                    otpExpiry: null,
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

    async searchByNameOrStudentID(
        name: string,
        faculty?: string,
    ): Promise<User[]> {
        const regex = new RegExp(name, 'i'); // Case-insensitive regex search
        let query: any = {
            $or: [{ fullname: regex }, { username: regex }],
        };

        if (faculty) {
            // If faculty is provided, filter by faculty first
            query = {
                faculty: new RegExp(faculty, 'i'), // Case-insensitive faculty filter
                $or: [{ fullname: regex }, { username: regex }],
            };
        }

        const users = await this.userModel.find(query);

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

    async updateMultipleUsersByStudentID(records: UpdateUsersDto[]) {
        const results = [];
        for (const { id, updates } of records) {
            const user = await this.userModel.findOne({ _id: id }).exec();
            if (!user) {
                throw new NotFoundException(
                    `Student with objectID ${id} not found`,
                );
            }

            try {
                Object.assign(user, updates);
                await user.save();
                results.push({
                    username: user.username,
                    status: 'updated',
                });
            } catch (error) {
                results.push({
                    username: user.username,
                    status: 'error',
                    message: error.message,
                });
            }
        }

        return results;
    }
}

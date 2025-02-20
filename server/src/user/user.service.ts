import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Parser } from 'json2csv';
import { User } from './entities/user.entity';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Role } from '../auth/enums/roles.enum';
import { UpdateUsersDto } from './dtos/user-update.dto';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { LoggerService } from '../logger/logger.service';
import { Faculty, Status, Program } from './entities/attributes.entity';
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        @InjectModel(Faculty.name)
        private readonly facultyModel: Model<Faculty>,
        @InjectModel(Program.name)
        private readonly programModel: Model<Program>,
        @InjectModel(Status.name)
        private readonly statusModel: Model<Status>,

        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService,
    ) {}

    async getMyProfile(profileUser: User): Promise<any> {
        try {
            const { id } = profileUser;
            const user = await this.userModel.findById(id).exec();

            if (!user) {
                throw new BadRequestException('User not found');
            }

            const foundStatus = await this.statusModel
                .findById(user.status)
                .exec();
            const foundProgram = await this.programModel
                .findById(user.program)
                .exec();
            const foundFaculty = await this.facultyModel
                .findById(user.faculty)
                .exec();
            const userProfile = {
                username: user.username,
                fullname: user.fullname,
                birthday: user.birthday
                    ? user.birthday.toISOString().split('T')[0]
                    : null,
                gender: user.gender,
                faculty: foundFaculty.name,
                classYear: user.classYear,
                program: foundProgram.name,
                address: user.address ? user.address : null,
                email: user.email,
                phone: user.phone ? user.phone : null,
                status: foundStatus.name,
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

    async findAll() {
        const users = await this.userModel.find().exec();
        if (!users.length) {
            throw new NotFoundException('No users found');
        }

        const newUsers = await Promise.all(
            users.map(async (user) => {
                const foundStatus = await this.statusModel
                    .findById(user.status)
                    .exec();
                const foundProgram = await this.programModel
                    .findById(user.program)
                    .exec();
                const foundFaculty = await this.facultyModel
                    .findById(user.faculty)
                    .exec();
                return {
                    username: user.username,
                    fullname: user.fullname,
                    birthday: user.birthday,
                    gender: user.gender,
                    faculty: foundFaculty.name,
                    classYear: user.classYear,
                    program: foundProgram.name,
                    address: user.address ? user.address : null,
                    email: user.email,
                    phone: user.phone ? user.phone : null,
                    status: foundStatus.name,
                    id: user.id,
                    role: user.role,
                };
            }),
        );
        return newUsers;
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
            const defaultStatus = await this.statusModel.findOne({
                status: 'Active',
            });
            const hashedPassword = await this.hashPassword(password);
            const user = await this.userModel.create({
                username: username,
                email: email,
                password: hashedPassword,
                birthday: new Date(birthday),
                fullname: fullname,
                gender: gender,
                faculty: faculty.toString(),
                classYear: classYear,
                program: program.toString(),
                address: address,
                phone: phone,
                status: defaultStatus._id.toString(),
                otp: null,
                otpExpiry: null,
                role: Role.STUDENT,
            });

            if (!user) {
                throw new InternalServerErrorException(
                    'This email or username is already in use',
                );
            }
            this.loggerService.logOperation(
                'INFO',
                'Create a student record with student ID',
                user.username,
            );
            return user;
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
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
        try {
            const result = await this.userModel
                .findOne({ username: id })
                .exec();

            if (result.role === Role.ADMIN) {
                this.loggerService.logOperation(
                    'ERROR',
                    'Cannot delete admin account',
                );
                throw new BadRequestException('Cannot delete admin account');
            }

            await this.userModel.deleteOne({ username: id }).exec();

            this.loggerService.logOperation(
                'INFO',
                'Delete a student record with student ID',
                result.username,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async createDefaultAttributes(): Promise<void> {
        try {
            const faculties = [
                'Faculty of Law',
                'Faculty of Business English',
                'Faculty of Japanese',
                'Faculty of French',
                'Unassigned',
            ];

            let isAllCreated = true;
            for (const faculty of faculties) {
                const facultyExists = await this.facultyModel
                    .findOne({ name: faculty })
                    .exec();

                if (facultyExists === null) {
                    await this.facultyModel.create({ name: faculty });
                    console.log(`Faculty ${faculty} created`);
                    isAllCreated = false;
                }
            }

            const programs = [
                'Formal Program',
                'High-Quality Program',
                'Advanced Program',
                'Unassigned',
            ];

            for (const program of programs) {
                const programExists = await this.programModel
                    .findOne({ name: program })
                    .exec();

                if (programExists === null) {
                    await this.programModel.create({ name: program });
                    console.log(`Program ${program} created`);
                    isAllCreated = false;
                }
            }

            const statuses = [
                'Active',
                'Graduated',
                'Leave',
                'Absent',
                'Unassigned',
            ];

            for (const status of statuses) {
                const statusExists = await this.statusModel
                    .findOne({ name: status })
                    .exec();

                if (statusExists === null) {
                    await this.statusModel.create({ name: status });
                    console.log(`Status ${status} created`);
                    isAllCreated = false;
                }
            }

            if (isAllCreated) {
                console.log('Default attributes already exist');
            }
        } catch (error) {
            console.log('Error creating default attributes: ', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async createDefaultAdmin(): Promise<void> {
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

                const defaultStatus = await this.statusModel.findOne({
                    name: 'Active',
                });
                const defaultProgram = await this.programModel.findOne({
                    name: 'Unassigned',
                });
                const defaultFaculty = await this.facultyModel.findOne({
                    name: 'Unassigned',
                });

                const admin = await this.userModel.create({
                    username: this.configService.get('ADMIN_USERNAME'),
                    email: this.configService.get('ADMIN_EMAIL'),
                    password: hashedPassword,
                    role: Role.ADMIN,
                    birthday: new Date(),
                    fullname: this.configService.get('ADMIN_FULLNAME'),
                    address: 'address',
                    phone: '0123456789',
                    program: defaultProgram._id.toString(),
                    faculty: defaultFaculty._id.toString(),
                    status: defaultStatus._id.toString(),
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

    async searchByNameOrStudentID(name: string, faculty?: string) {
        try {
            const regex = new RegExp(name, 'i');
            let query: any = {
                $or: [{ fullname: regex }, { username: regex }],
            };

            if (faculty) {
                const foundFaculty = await this.facultyModel.find({
                    name: new RegExp(faculty, 'i'),
                });
                console.log(foundFaculty);
                query = {
                    faculty: foundFaculty[0]._id.toString(),
                    $or: [{ fullname: regex }, { username: regex }],
                };
            }

            const users = await this.userModel.find(query);

            if (!users.length) {
                throw new NotFoundException(
                    'No users found matching the criteria',
                );
            }

            const newUsers = await Promise.all(
                users.map(async (user) => {
                    const foundStatus = await this.statusModel
                        .findById(user.status)
                        .exec();
                    const foundProgram = await this.programModel
                        .findById(user.program)
                        .exec();
                    const foundFaculty = await this.facultyModel
                        .findById(user.faculty)
                        .exec();
                    return {
                        ...user.toObject(),
                        faculty: foundFaculty.name,
                        program: foundProgram.name,
                        status: foundStatus.name,
                    };
                }),
            );
            return newUsers;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
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
                this.loggerService.logOperation(
                    'ERROR',
                    `Failed to update student with student ID ${user.username}`,
                );
                results.push({
                    username: user.username,
                    status: 'error',
                    message: error.message,
                });
            }
        }

        this.loggerService.logOperation(
            'INFO',
            'Updated multiple student records',
        );
        return results;
    }

    async importUsers(file: Express.Multer.File) {
        if (!file) {
            this.loggerService.logOperation('ERROR', '', 'No file uploaded');
            throw new BadRequestException('No file uploaded');
        }

        let users = [];

        if (file.mimetype === 'application/json') {
            users = JSON.parse(file.buffer.toString());
        } else if (
            file.mimetype === 'text/csv' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            const csvData = file.buffer.toString();
            users = await new Promise((resolve, reject) => {
                const results = [];
                Readable.from(csvData)
                    .pipe(csvParser())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (err) => reject(err));
            });
        } else {
            this.loggerService.logOperation(
                'ERROR',
                'Invalid file format. Use CSV or JSON',
            );
            throw new BadRequestException(
                'Invalid file format. Use CSV or JSON',
            );
        }

        try {
            const newUsers = await Promise.all(
                users.map(async (user) => {
                    const foundStatus = await this.statusModel
                        .findOne({ name: user.status })
                        .exec();
                    const foundProgram = await this.programModel
                        .findOne({ name: user.program })
                        .exec();
                    const foundFaculty = await this.facultyModel
                        .findOne({ name: user.faculty })
                        .exec();
                    console.log(
                        user.username,
                        foundStatus._id,
                        foundProgram._id,
                        foundFaculty._id,
                    );
                    return {
                        ...user,
                        faculty: foundFaculty._id.toString(),
                        program: foundProgram._id.toString(),
                        status: foundStatus._id.toString(),
                    };
                }),
            );

            await this.userModel.insertMany(newUsers);
            this.loggerService.logOperation(
                'INFO',
                'Imported users from file',
                file.originalname,
            );
            return newUsers;
        } catch (error) {
            console.log(error.message);
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async exportUsersJson() {
        try {
            const users = await this.findAll();
            const newUsers = users.map((user) => {
                return {
                    username: user.username,
                    email: user.email,
                    fullname: user.fullname,
                    birthday: user.birthday,
                    gender: user.gender,
                    faculty: user.faculty,
                    classYear: user.classYear,
                    program: user.program,
                    address: user.address,
                    phone: user.phone,
                    status: user.status,
                    role: user.role,
                };
            });
            this.loggerService.logOperation('INFO', 'Exported users to JSON');
            return JSON.stringify(newUsers, null, 2);
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async exportUsersCsv() {
        try {
            const users = await this.findAll();
            const newUsers = users.map((user) => ({
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                birthday: user.birthday,
                gender: user.gender,
                faculty: user.faculty,
                classYear: user.classYear,
                program: user.program,
                address: user.address,
                phone: `'${user.phone}`,
                status: user.status,
                role: user.role,
            }));

            const json2csvParser = new Parser({
                withBOM: true,
            });

            this.loggerService.logOperation('INFO', 'Exported users to CSV');
            return json2csvParser.parse(newUsers);
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async fetchAttributeSchema(attribute: string): Promise<any> {
        const schemaModels: Record<string, Model<any>> = {
            faculty: this.facultyModel,
            status: this.statusModel,
            program: this.programModel,
        };

        if (!schemaModels[attribute]) {
            throw new Error(`Schema for '${attribute}' not found.`);
        }

        return await schemaModels[attribute].find().exec();
    }
}

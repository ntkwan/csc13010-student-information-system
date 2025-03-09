import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Parser } from 'json2csv';
import { User } from './entities/user.entity';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { Role } from '../auth/enums/roles.enum';
import { UpdateUsersDto } from './dtos/user-update.dto';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { LoggerService } from '../logger/logger.service';
import { UserRepository } from './user.repository';
import { AttributesRepository } from './attributes.repository';
@Injectable()
export class UserService {
    constructor(
        private readonly attributesRepository: AttributesRepository,
        private readonly userRepository: UserRepository,

        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService,
    ) {}

    async getMyProfile(profileUser: User): Promise<any> {
        try {
            const { id } = profileUser;
            const user = await this.userRepository.findById(id);

            if (!user) {
                throw new BadRequestException('User not found');
            }

            const foundStatus = await this.attributesRepository.findStatus({
                _id: user.status,
            });
            const foundProgram = await this.attributesRepository.findProgram({
                _id: user.program,
            });
            const foundFaculty = await this.attributesRepository.findFaculty({
                _id: user.faculty,
            });
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
        const users = await this.userRepository.findAll();
        if (!users.length) {
            throw new NotFoundException('No users found');
        }

        const newUsers = await Promise.all(
            users.map(async (user) => {
                const foundStatus = await this.attributesRepository.findStatus({
                    _id: user.status,
                });
                const foundProgram =
                    await this.attributesRepository.findProgram({
                        _id: user.program,
                    });
                const foundFaculty =
                    await this.attributesRepository.findFaculty({
                        _id: user.faculty,
                    });
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
        const user: User = await this.userRepository.findOne({
            email,
            otp,
            otpExpiry,
        });
        if (!user) {
            throw new InternalServerErrorException(
                `User with email: ${email} not found`,
            );
        }
        return user;
    }

    async findByOtpOnly(email: string, otp: string): Promise<User> {
        const user: User = await this.userRepository.findOne({
            email: email,
            otp: otp,
        });
        if (!user) {
            throw new InternalServerErrorException(`User ${email} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user: User = await this.userRepository.findOne({ email: email });
        if (!user) {
            throw new InternalServerErrorException(`User ${email} not found`);
        }
        return user;
    }

    async findById(id: string): Promise<User> {
        const user: User = await this.userRepository.findById(id);
        if (!user) {
            throw new InternalServerErrorException(
                `User with id ${id} not found`,
            );
        }
        return user;
    }

    async validatePassword(password: string, user: User): Promise<boolean> {
        try {
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
            const defaultStatus = await this.attributesRepository.findStatus({
                name: 'Active',
            });
            const hashedPassword = await this.hashPassword(password);
            const foundProgram = await this.attributesRepository.findProgram({
                name: program,
            });
            const foundFaculty = await this.attributesRepository.findFaculty({
                name: faculty,
            });

            const user = await this.userRepository.create({
                username: username,
                email: email,
                password: hashedPassword,
                birthday: new Date(birthday),
                fullname: fullname,
                gender: gender,
                faculty: new Types.ObjectId(
                    typeof foundFaculty._id !== 'string'
                        ? foundFaculty._id.toString()
                        : foundFaculty._id,
                ),
                classYear: classYear,
                program: new Types.ObjectId(
                    typeof foundProgram._id !== 'string'
                        ? foundProgram._id.toString()
                        : foundProgram._id,
                ),
                address: address,
                phone: phone,
                status: new Types.ObjectId(
                    typeof defaultStatus._id !== 'string'
                        ? defaultStatus._id.toString()
                        : defaultStatus._id,
                ),
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

    async updateRefreshToken(
        username: string,
        refreshToken: string,
    ): Promise<void> {
        try {
            await this.userRepository.update(
                { username: username },
                { refreshToken },
            );
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
            await this.userRepository.update({ email }, { otp, otpExpiry });
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updatePassword(email: string, password: string): Promise<void> {
        try {
            const hashedPassword = await this.hashPassword(password);
            await this.userRepository.update(
                { email: email },
                { password: hashedPassword, otp: null, otpExpiry: null },
            );
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async removeByStudentId(id: string): Promise<void> {
        try {
            const result = await this.userRepository.findOne({ username: id });

            if (result.role === Role.ADMIN) {
                this.loggerService.logOperation(
                    'ERROR',
                    'Cannot delete admin account',
                );
                throw new BadRequestException('Cannot delete admin account');
            }

            await this.userRepository.delete({ username: id });

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
                const facultyExists =
                    await this.attributesRepository.findFaculty({
                        name: faculty,
                    });

                if (facultyExists === null) {
                    await this.attributesRepository.createFaculty({
                        name: faculty,
                    });
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
                const programExists =
                    await this.attributesRepository.findProgram({
                        name: program,
                    });

                if (programExists === null) {
                    await this.attributesRepository.createProgram({
                        name: program,
                    });
                    console.log(`Program ${program} created`);
                    isAllCreated = false;
                }
            }

            const statuses = [
                {
                    name: 'Active',
                    order: 2,
                },
                {
                    name: 'Graduated',
                    order: 3,
                },
                {
                    name: 'Leave',
                    order: 3,
                },
                {
                    name: 'Absent',
                    order: 3,
                },
                {
                    name: 'Unassigned',
                    order: 1,
                },
            ];

            for (const status of statuses) {
                const statusExists = await this.attributesRepository.findStatus(
                    { name: status.name },
                );

                if (statusExists === null) {
                    await this.attributesRepository.createStatus({
                        name: status.name,
                        order: status.order,
                    });
                    console.log(`Status ${status.name} created`);
                    isAllCreated = false;
                }
            }

            const settings = [
                {
                    emailSuffix: '@student.university.edu.vn',
                    phonePrefix: '+84',
                },
            ];

            for (const setting of settings) {
                const settingExists =
                    await this.attributesRepository.findSetting({
                        emailSuffix: setting.emailSuffix,
                    });

                if (settingExists === null) {
                    await this.attributesRepository.createSetting(setting);
                    console.log(
                        `Setting ${setting.emailSuffix} & ${setting.phonePrefix} created`,
                    );
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
            const adminExists = await this.userRepository.findOne({
                role: Role.ADMIN,
            });

            if (adminExists === null) {
                const adminPassword: string =
                    this.configService.get('ADMIN_PASSWORD');
                const hashedPassword = await this.hashPassword(adminPassword);

                const defaultStatus =
                    await this.attributesRepository.findStatus({
                        name: 'Active',
                    });
                const defaultProgram =
                    await this.attributesRepository.findProgram({
                        name: 'Unassigned',
                    });
                const defaultFaculty =
                    await this.attributesRepository.findFaculty({
                        name: 'Unassigned',
                    });

                const admin = await this.userRepository.create({
                    username: this.configService.get('ADMIN_USERNAME'),
                    email: this.configService.get('ADMIN_EMAIL'),
                    password: hashedPassword,
                    role: Role.ADMIN,
                    birthday: new Date(),
                    fullname: this.configService.get('ADMIN_FULLNAME'),
                    address: 'address',
                    phone: '0123456789',
                    program: new Types.ObjectId(
                        typeof defaultProgram._id !== 'string'
                            ? defaultProgram._id.toString()
                            : defaultProgram._id,
                    ),
                    faculty: new Types.ObjectId(
                        typeof defaultFaculty._id !== 'string'
                            ? defaultFaculty._id.toString()
                            : defaultFaculty._id,
                    ),
                    status: new Types.ObjectId(
                        typeof defaultStatus._id !== 'string'
                            ? defaultStatus._id.toString()
                            : defaultStatus._id,
                    ),
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
        const regex = new RegExp(name, 'i');
        let query: any = {
            $or: [{ fullname: regex }, { username: regex }],
        };

        if (faculty) {
            const foundFaculty = await this.attributesRepository.findFaculty({
                name: new RegExp(faculty, 'i'),
            });
            query = {
                faculty: foundFaculty[0]._id.toString(),
                $or: [{ fullname: regex }, { username: regex }],
            };
        }

        const users = await this.userRepository.find(query);
        if (!users.length) {
            throw new NotFoundException('No users found matching the criteria');
        }

        const newUsers = await Promise.all(
            users.map(async (user) => {
                const foundStatus = await this.attributesRepository.findStatus({
                    _id: user.status,
                });
                const foundProgram =
                    await this.attributesRepository.findProgram({
                        _id: user.program,
                    });
                const foundFaculty =
                    await this.attributesRepository.findFaculty({
                        _id: user.faculty,
                    });
                return {
                    ...user.toObject(),
                    faculty: foundFaculty.name,
                    program: foundProgram.name,
                    status: foundStatus.name,
                };
            }),
        );
        return newUsers;
    }

    async updateRole(id: string, role: string): Promise<void> {
        try {
            const user = await this.userRepository.findById(id);

            if (user.role === role) {
                throw new InternalServerErrorException(
                    'User already has this role',
                );
            }

            await this.userRepository.update({ _id: id }, { role });
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateUniversitySettings(
        phonePrefix: string,
        emailSuffix: string,
    ): Promise<void> {
        try {
            const setting = await this.attributesRepository.findAllSetting();
            const oldPhonePrefix = setting[0].phonePrefix;
            const oldEmailSuffix = setting[0].emailSuffix;

            if (
                oldPhonePrefix === phonePrefix &&
                oldEmailSuffix === emailSuffix
            ) {
                throw new InternalServerErrorException(
                    'Settings are already up to date',
                );
            }

            const formattedPhonePrefix = `+${phonePrefix.trim()}`;
            await this.attributesRepository.updateSetting(
                {},
                {
                    emailSuffix: emailSuffix,
                    phonePrefix: formattedPhonePrefix,
                },
            );

            this.loggerService.logOperation(
                'INFO',
                `Updated university settings: ${oldEmailSuffix} -> ${emailSuffix}, ${oldPhonePrefix} -> ${phonePrefix}`,
            );
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getUniversitySettings() {
        try {
            const setting = await this.attributesRepository.findAllSetting();
            return setting[0];
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateMultipleUsersByStudentID(records: UpdateUsersDto[]) {
        const results = [];
        for (const { id, updates } of records) {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException(
                    `Student with objectID ${id} not found`,
                );
            }

            const existedUsername = await this.userRepository.findOne({
                username: updates.username,
            });

            if (existedUsername && existedUsername._id.toString() !== id) {
                this.loggerService.logOperation(
                    'ERROR',
                    `Student with student ID ${updates.username} already exists`,
                );
                results.push({
                    username: updates.username,
                    status: 'error',
                    message: 'Student ID already exists',
                });
                throw new BadRequestException('Student ID already exists');
            }

            try {
                const foundStatus = await this.attributesRepository.findStatus({
                    name: updates.status,
                });
                const foundProgram =
                    await this.attributesRepository.findProgram({
                        name: updates.program,
                    });
                const foundFaculty =
                    await this.attributesRepository.findFaculty({
                        name: updates.faculty,
                    });
                const newUpdates = {
                    ...updates,
                    faculty: foundFaculty._id.toString(),
                    program: foundProgram._id.toString(),
                    status: foundStatus._id.toString(),
                };
                Object.assign(user, newUpdates);
                await user.save();
                this.loggerService.logOperation(
                    'INFO',
                    `Updated student with student ID ${user.username}`,
                );
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
                    const foundStatus =
                        await this.attributesRepository.findStatus({
                            name: user.status,
                        });
                    const foundProgram =
                        await this.attributesRepository.findProgram({
                            name: user.program,
                        });
                    const foundFaculty =
                        await this.attributesRepository.findFaculty({
                            name: user.faculty,
                        });

                    return {
                        ...user,
                        faculty: foundFaculty._id.toString(),
                        program: foundProgram._id.toString(),
                        status: foundStatus._id.toString(),
                    };
                }),
            );

            await this.userRepository.insertMany(newUsers);
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
            faculty: this.attributesRepository.facultyModel,
            status: this.attributesRepository.statusModel,
            program: this.attributesRepository.programModel,
        };

        if (!schemaModels[attribute]) {
            throw new Error(`Schema for '${attribute}' not found.`);
        }

        return await schemaModels[attribute].find().exec();
    }

    async changeAttributeName(
        attribute: string,
        oldName: string,
        newName: string,
    ): Promise<void> {
        const schemaModels: Record<string, Model<any>> = {
            faculty: this.attributesRepository.facultyModel,
            status: this.attributesRepository.statusModel,
            program: this.attributesRepository.programModel,
        };

        if (!schemaModels[attribute]) {
            throw new Error(`Schema for '${attribute}' not found.`);
        }

        try {
            const isOldNameExists = await schemaModels[attribute]
                .findOne({ name: oldName })
                .exec();
            if (!isOldNameExists) {
                throw new NotFoundException(
                    `Attribute with name '${oldName}' not found`,
                );
            }

            const isNewNameExists = await schemaModels[attribute]
                .findOne({ name: newName })
                .exec();
            if (isNewNameExists) {
                return;
            }

            await schemaModels[attribute].findOneAndUpdate(
                { name: oldName },
                { name: newName },
            );
            this.loggerService.logOperation(
                'INFO',
                `Changed ${attribute} name from ${oldName} to ${newName}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async addAttribute(attribute: string, name: string) {
        const schemaModels: Record<string, Model<any>> = {
            faculty: this.attributesRepository.facultyModel,
            program: this.attributesRepository.programModel,
        };

        if (!schemaModels[attribute]) {
            throw new Error(`Schema for '${attribute}' not found.`);
        }

        try {
            const isNameExists = await schemaModels[attribute]
                .findOne({ name: name })
                .exec();
            if (isNameExists) {
                throw new BadRequestException(
                    `Attribute with name '${name}' already exists`,
                );
            }

            await schemaModels[attribute].create({ name: name });
            this.loggerService.logOperation(
                'INFO',
                `Added new ${attribute} with name ${name}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async changeStatusOrder(name, order) {
        try {
            const status = await this.attributesRepository.findStatus({ name });
            if (!status) {
                throw new NotFoundException(
                    `Status with name '${name}' not found`,
                );
            }
            const oldOrder = status.order;
            if (oldOrder === order) {
                throw new BadRequestException(
                    `Status with name '${name}' already has order ${order}`,
                );
            }

            await this.attributesRepository.updateStatus({ name }, { order });
            this.loggerService.logOperation(
                'INFO',
                `Changed status order for ${name} from ${oldOrder} to ${order}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async addStatusAttribute(name, order) {
        try {
            const status = await this.attributesRepository.findStatus({ name });
            if (status) {
                throw new BadRequestException(
                    `Status with name '${name}' already exists`,
                );
            }

            await this.attributesRepository.createStatus({ name, order });
            this.loggerService.logOperation(
                'INFO',
                `Added new status with name ${name} and order ${order}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }
}

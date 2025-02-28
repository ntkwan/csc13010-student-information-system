import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { Role } from '../auth/enums/roles.enum';
import { User } from './entities/user.entity';
import {
    Faculty,
    Program,
    Status,
    Setting,
} from './entities/attributes.entity';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import * as bcrypt from 'bcrypt';
import { Gender } from './enums/student.enum';
import { NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    genSalt: jest.fn(),
    hash: jest.fn(),
}));

const createModelMock = () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    insertMany: jest.fn(),
    find: jest.fn(),
});

describe('UserService', () => {
    let service: UserService;
    let userModel: any;
    let facultyModel: any;
    let programModel: any;
    let statusModel: any;
    let settingModel: any;
    let configService: any;
    let loggerService: any;

    beforeEach(async () => {
        userModel = createModelMock();
        facultyModel = createModelMock();
        programModel = createModelMock();
        statusModel = createModelMock();
        settingModel = createModelMock();

        configService = { get: jest.fn() };
        loggerService = { logOperation: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: getModelToken(User.name), useValue: userModel },
                {
                    provide: getModelToken(Faculty.name),
                    useValue: facultyModel,
                },
                {
                    provide: getModelToken(Program.name),
                    useValue: programModel,
                },
                { provide: getModelToken(Status.name), useValue: statusModel },
                {
                    provide: getModelToken(Setting.name),
                    useValue: settingModel,
                },
                { provide: ConfigService, useValue: configService },
                { provide: LoggerService, useValue: loggerService },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    describe('getMyProfile', () => {
        it('should return a user profile if user exists', async () => {
            const fakeUser = {
                id: '1',
                username: 'testuser',
                fullname: 'Test User',
                birthday: new Date('2000-01-01'),
                gender: 'MALE',
                faculty: 'facultyId',
                classYear: 2020,
                program: 'programId',
                address: 'address',
                email: 'test@example.com',
                phone: '1234567890',
                status: 'statusId',
                role: Role.STUDENT,
            };
            userModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(fakeUser),
            });
            statusModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'Active' }),
            });
            programModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'CS' }),
            });
            facultyModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'Engineering' }),
            });

            const profile = await service.getMyProfile({ id: '1' } as User);
            expect(profile).toEqual({
                username: fakeUser.username,
                fullname: fakeUser.fullname,
                birthday: '2000-01-01',
                gender: fakeUser.gender,
                faculty: 'Engineering',
                classYear: fakeUser.classYear,
                program: 'CS',
                address: fakeUser.address,
                email: fakeUser.email,
                phone: fakeUser.phone,
                status: 'Active',
                id: fakeUser.id,
                role: fakeUser.role,
            });
        });

        it('should throw error if user not found', async () => {
            userModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            await expect(
                service.getMyProfile({ id: '1' } as User),
            ).rejects.toThrow();
        });
    });

    describe('findAll', () => {
        it('should throw NotFoundException if no users found', async () => {
            userModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });
            await expect(service.findAll()).rejects.toThrow();
        });

        it('should return mapped users if found', async () => {
            const fakeUsers = [
                {
                    id: '1',
                    username: 'testuser',
                    fullname: 'Test User',
                    birthday: new Date('2000-01-01'),
                    gender: 'MALE',
                    faculty: 'facultyId',
                    classYear: 2020,
                    program: 'programId',
                    address: 'address',
                    email: 'test@example.com',
                    phone: '1234567890',
                    status: 'statusId',
                    role: Role.STUDENT,
                    // toObject method to simulate Mongoose document conversion
                    toObject: function () {
                        return this;
                    },
                },
            ];
            userModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(fakeUsers),
            });
            statusModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'Active' }),
            });
            programModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'CS' }),
            });
            facultyModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'Engineering' }),
            });

            const result = await service.findAll();
            expect(result).toEqual([
                {
                    username: fakeUsers[0].username,
                    fullname: fakeUsers[0].fullname,
                    birthday: fakeUsers[0].birthday,
                    gender: fakeUsers[0].gender,
                    faculty: 'Engineering',
                    classYear: fakeUsers[0].classYear,
                    program: 'CS',
                    address: fakeUsers[0].address,
                    email: fakeUsers[0].email,
                    phone: fakeUsers[0].phone,
                    status: 'Active',
                    id: fakeUsers[0].id,
                    role: fakeUsers[0].role,
                },
            ]);
        });
    });

    describe('findByOtpOnly', () => {
        it('should return user if found', async () => {
            const fakeUser = {
                id: '1',
                email: 'test@example.com',
                otp: '123456',
            };
            userModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(fakeUser),
            });
            const result = await service.findByOtpOnly(
                'test@example.com',
                '123456',
            );
            expect(result).toEqual(fakeUser);
        });

        it('should throw error if user not found', async () => {
            userModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            await expect(
                service.findByOtpOnly('test@example.com', '123456'),
            ).rejects.toThrow();
        });
    });

    describe('validatePassword', () => {
        it('should return true if passwords match', async () => {
            const fakeUser = { password: 'hashed' } as User;
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            const result = await service.validatePassword('plain', fakeUser);
            expect(result).toBe(true);
        });

        it('should throw error if bcrypt.compare fails', async () => {
            const fakeUser = { password: 'hashed' } as User;
            jest.spyOn(bcrypt, 'compare').mockRejectedValue(
                new Error('bcrypt error'),
            );
            await expect(
                service.validatePassword('plain', fakeUser),
            ).rejects.toThrow();
        });
    });

    describe('hashPassword', () => {
        it('should hash password correctly', async () => {
            jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(10);
            jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
            const result = await service.hashPassword('plain');
            expect(result).toBe('hashedPassword');
        });
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            const dto = {
                username: 'user1',
                fullname: 'User One',
                birthday: '2000-01-01',
                gender: Gender.MALE,
                faculty: 'Engineering',
                classYear: 2020,
                program: 'CS',
                address: 'address',
                email: 'user@example.com',
                password: 'password',
                phone: '1234567890',
            };
            jest.spyOn(service, 'hashPassword').mockResolvedValue(
                'hashedPassword',
            );
            statusModel.findOne.mockReturnValue({
                exec: jest
                    .fn()
                    .mockResolvedValue({ _id: 'statusId', name: 'Active' }),
            });
            programModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'programId' }),
            });
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'facultyId' }),
            });
            userModel.create.mockResolvedValue({
                ...dto,
                _id: '1',
                role: Role.STUDENT,
            });

            const user = await service.create(dto);
            expect(user).toBeDefined();
            expect(userModel.create).toHaveBeenCalled();
            expect(loggerService.logOperation).toHaveBeenCalled();
        });

        it('should throw error if user creation fails', async () => {
            const dto = {
                username: 'user1',
                fullname: 'User One',
                birthday: '2000-01-01',
                gender: Gender.MALE,
                faculty: 'Engineering',
                classYear: 2020,
                program: 'CS',
                address: 'address',
                email: 'user@example.com',
                password: 'password',
                phone: '1234567890',
            };
            jest.spyOn(service, 'hashPassword').mockResolvedValue(
                'hashedPassword',
            );
            statusModel.findOne.mockReturnValue({
                exec: jest
                    .fn()
                    .mockResolvedValue({ _id: 'statusId', name: 'Active' }),
            });
            programModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'programId' }),
            });
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'facultyId' }),
            });
            userModel.create.mockResolvedValue(null);

            await expect(service.create(dto)).rejects.toThrow();
        });
    });

    describe('updateRefreshToken', () => {
        it('should update refresh token', async () => {
            userModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            await service.updateRefreshToken('user1', 'newToken');
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { username: 'user1' },
                { refreshToken: 'newToken' },
            );
        });
    });

    describe('updateOtp', () => {
        it('should update otp', async () => {
            userModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            const now = new Date();
            await service.updateOtp('user@example.com', '123456', now);
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { email: 'user@example.com' },
                { otp: '123456', otpExpiry: now },
            );
        });
    });

    describe('updatePassword', () => {
        it('should update password', async () => {
            jest.spyOn(service, 'hashPassword').mockResolvedValue(
                'hashedPassword',
            );
            userModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            await service.updatePassword('user@example.com', 'newPassword');
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { email: 'user@example.com' },
                { password: 'hashedPassword', otp: null, otpExpiry: null },
            );
        });
    });

    describe('removeByStudentId', () => {
        it('should throw error if trying to delete admin account', async () => {
            const adminUser = { role: Role.ADMIN, username: 'admin' };
            userModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(adminUser),
            });
            await expect(service.removeByStudentId('admin')).rejects.toThrow();
        });

        it('should delete a student and log operation', async () => {
            const studentUser = { role: Role.STUDENT, username: 'student' };
            userModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(studentUser),
            });
            userModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            await service.removeByStudentId('student');
            expect(userModel.deleteOne).toHaveBeenCalledWith({
                username: 'student',
            });
            expect(loggerService.logOperation).toHaveBeenCalled();
        });
    });

    describe('searchByNameOrStudentID', () => {
        it('should throw NotFoundException if no users found', async () => {
            userModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });
            await expect(
                service.searchByNameOrStudentID('nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateRole', () => {
        it('should throw error if user already has the role', async () => {
            const fakeUser = { role: 'STUDENT' };
            userModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(fakeUser),
            });
            await expect(service.updateRole('1', 'STUDENT')).rejects.toThrow();
        });

        it('should update user role if different', async () => {
            const fakeUser = { role: 'STUDENT' };
            userModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(fakeUser),
            });
            userModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            await service.updateRole('1', 'TEACHER');
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: '1' },
                { role: 'TEACHER' },
            );
        });
    });

    describe('updateUniversitySettings', () => {
        it('should throw error if settings are already up to date', async () => {
            const setting = [
                { phonePrefix: '+84', emailSuffix: 'example.com' },
            ];
            settingModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(setting),
            });
            await expect(
                service.updateUniversitySettings('84', 'example.com'),
            ).rejects.toThrow();
        });

        it('should update settings if different', async () => {
            const setting = [{ phonePrefix: '+84', emailSuffix: 'old.com' }];
            settingModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(setting),
            });
            settingModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            await service.updateUniversitySettings('84', 'new.com');
            expect(settingModel.findOneAndUpdate).toHaveBeenCalled();
        });
    });

    describe('getUniversitySettings', () => {
        it('should return the settings', async () => {
            const setting = [
                { phonePrefix: '+84', emailSuffix: 'example.com' },
            ];
            settingModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(setting),
            });
            const result = await service.getUniversitySettings();
            expect(result).toEqual(setting[0]);
        });
    });

    describe('updateMultipleUsersByStudentID', () => {
        it('should throw NotFoundException if user not found', async () => {
            userModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            const records = [{ id: '1', updates: { username: 'user1' } }];
            await expect(
                service.updateMultipleUsersByStudentID(records),
            ).rejects.toThrow();
        });

        it('should update multiple users and return results', async () => {
            const fakeUser = {
                _id: '1',
                username: 'user1',
                save: jest.fn().mockResolvedValue({}),
            };
            userModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(fakeUser),
            });
            userModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            }); // For existedUsername check
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 's1' }),
            });
            programModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'p1' }),
            });
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'f1' }),
            });
            fakeUser.save = jest.fn().mockResolvedValue({});
            const records = [
                {
                    id: '1',
                    updates: {
                        username: 'user_1',
                        status: 'Active',
                        program: 'CS',
                        faculty: '2',
                    },
                },
            ];
            const result =
                await service.updateMultipleUsersByStudentID(records);
            expect(result[0]).toHaveProperty('status', 'updated');
        });
    });

    describe('importUsers', () => {
        it('should throw BadRequestException if no file uploaded', async () => {
            await expect(service.importUsers(null)).rejects.toThrow();
        });

        it('should import users from JSON file', async () => {
            const file = {
                mimetype: 'application/json',
                buffer: Buffer.from(
                    JSON.stringify([
                        {
                            email: 'user@example.com',
                            status: 'Active',
                            program: 'CS',
                            faculty: 'Engineering',
                        },
                    ]),
                ),
            } as Express.Multer.File;
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 's1' }),
            });
            programModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'p1' }),
            });
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'f1' }),
            });
            userModel.insertMany.mockResolvedValue([
                { email: 'user@example.com' },
            ]);
            const result = await service.importUsers(file);
            expect(result).toBeDefined();
            expect(userModel.insertMany).toHaveBeenCalled();
        });

        it('should import users from CSV file', async () => {
            const csvContent = `email,status,program,faculty
user@example.com,Active,CS,Engineering`;
            const file = {
                mimetype: 'text/csv',
                buffer: Buffer.from(csvContent),
            } as Express.Multer.File;
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 's1' }),
            });
            programModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'p1' }),
            });
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ _id: 'f1' }),
            });
            userModel.insertMany.mockResolvedValue([
                { email: 'user@example.com' },
            ]);
            const result = await service.importUsers(file);
            expect(result).toBeDefined();
            expect(userModel.insertMany).toHaveBeenCalled();
        });

        it('should throw error for invalid file format', async () => {
            const file = {
                mimetype: 'image/png',
                buffer: Buffer.from('test'),
            } as Express.Multer.File;
            await expect(service.importUsers(file)).rejects.toThrow();
        });
    });

    describe('exportUsersJson', () => {
        it('should export users as JSON string', async () => {
            const fakeUsers = [
                {
                    id: '1',
                    username: 'user1',
                    email: 'user@example.com',
                    fullname: 'User One',
                    birthday: new Date(),
                    gender: Gender.MALE,
                    faculty: 'Engineering',
                    classYear: 2020,
                    program: 'CS',
                    address: 'address',
                    phone: '1234567890',
                    status: 'Active',
                    role: Role.STUDENT,
                },
            ];
            jest.spyOn(service, 'findAll').mockResolvedValue(fakeUsers);
            const result = await service.exportUsersJson();
            expect(typeof result).toBe('string');
            expect(result).toContain('user1');
        });
    });

    describe('exportUsersCsv', () => {
        it('should export users as CSV string', async () => {
            const fakeUsers = [
                {
                    id: '1',
                    username: 'user1',
                    email: 'user@example.com',
                    fullname: 'User One',
                    birthday: new Date(),
                    gender: Gender.MALE,
                    faculty: 'Engineering',
                    classYear: 2020,
                    program: 'CS',
                    address: 'address',
                    phone: '1234567890',
                    status: 'Active',
                    role: Role.STUDENT,
                },
            ];
            jest.spyOn(service, 'findAll').mockResolvedValue(fakeUsers);
            const result = await service.exportUsersCsv();
            expect(typeof result).toBe('string');
            expect(result).toContain('user1');
        });
    });

    describe('fetchAttributeSchema', () => {
        it('should throw error if schema not found', async () => {
            await expect(
                service.fetchAttributeSchema('nonexistent'),
            ).rejects.toThrow();
        });

        it('should return attributes if schema found', async () => {
            const attributes = [{ name: 'Engineering' }, { name: 'Science' }];
            // For example, testing "faculty" schema:
            facultyModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(attributes),
            });
            const result = await service.fetchAttributeSchema('faculty');
            expect(result).toEqual(attributes);
        });
    });

    describe('changeAttributeName', () => {
        it('should throw error if old name not found', async () => {
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            await expect(
                service.changeAttributeName('faculty', 'old', 'new'),
            ).rejects.toThrow();
        });

        it('should update attribute name if old name exists and new name does not exist', async () => {
            facultyModel.findOne
                .mockReturnValueOnce({
                    exec: jest.fn().mockResolvedValue({ name: 'old' }),
                }) // for isOldNameExists
                .mockReturnValueOnce({
                    exec: jest.fn().mockResolvedValue(null),
                }); // for isNewNameExists
            facultyModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            await service.changeAttributeName('faculty', 'old', 'new');
            expect(facultyModel.findOneAndUpdate).toHaveBeenCalledWith(
                { name: 'old' },
                { name: 'new' },
            );
        });
    });

    describe('addAttribute', () => {
        it('should throw error if attribute schema not found', async () => {
            await expect(
                service.addAttribute('invalid', 'name'),
            ).rejects.toThrow();
        });

        it('should throw error if attribute already exists', async () => {
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'name' }),
            });
            await expect(
                service.addAttribute('faculty', 'name'),
            ).rejects.toThrow();
        });

        it('should add attribute if not exists', async () => {
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            facultyModel.create.mockResolvedValue({ name: 'name' });
            await service.addAttribute('faculty', 'name');
            expect(facultyModel.create).toHaveBeenCalledWith({ name: 'name' });
        });
    });

    describe('changeStatusOrder', () => {
        it('should throw error if status not found', async () => {
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            await expect(
                service.changeStatusOrder('Nonexistent', 1),
            ).rejects.toThrow();
        });

        it('should throw error if status already has that order', async () => {
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'Active', order: 1 }),
            });
            await expect(
                service.changeStatusOrder('Active', 1),
            ).rejects.toThrow();
        });

        it('should update status order if valid', async () => {
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'Active', order: 1 }),
            });
            statusModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
            });
            await service.changeStatusOrder('Active', 2);
            expect(statusModel.findOneAndUpdate).toHaveBeenCalledWith(
                { name: 'Active' },
                { order: 2 },
            );
        });
    });

    describe('addStatusAttribute', () => {
        it('should throw error if status already exists', async () => {
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ name: 'Active' }),
            });
            await expect(
                service.addStatusAttribute('Active', 1),
            ).rejects.toThrow();
        });

        it('should add status attribute if not exists', async () => {
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });
            statusModel.create.mockResolvedValue({ name: 'Active', order: 1 });
            await service.addStatusAttribute('Active', 1);
            expect(statusModel.create).toHaveBeenCalledWith({
                name: 'Active',
                order: 1,
            });
        });
    });
});

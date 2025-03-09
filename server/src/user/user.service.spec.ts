import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Role } from '../auth/enums/roles.enum';
import { User } from './entities/user.entity';
import {
    Faculty,
    Program,
    Setting,
    Status,
} from './entities/attributes.entity';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import * as bcrypt from 'bcrypt';
import { Gender } from './enums/student.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';

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
    let facultyModel: any;
    let programModel: any;
    let statusModel: any;
    let configService: any;
    let loggerService: any;
    let userRepository: UserRepository;

    beforeEach(async () => {
        facultyModel = createModelMock();
        programModel = createModelMock();
        statusModel = createModelMock();

        configService = { get: jest.fn() };
        loggerService = { logOperation: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: {
                        find: jest.fn(),
                        findById: jest.fn(),
                        findStatus: jest.fn(),
                        findProgram: jest.fn(),
                        findFaculty: jest.fn(),
                        findSetting: jest.fn(),
                        findOne: jest.fn(),
                        findByEmail: jest.fn(),
                        create: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        insertMany: jest.fn(),
                        findAllStatus: jest.fn(),
                        findAllProgram: jest.fn(),
                        findAllFaculty: jest.fn(),
                        findAllSetting: jest.fn(),
                        updateStatus: jest.fn(),
                        updateProgram: jest.fn(),
                        updateFaculty: jest.fn(),
                        updateSetting: jest.fn(),
                        createStatus: jest.fn(),
                        createProgram: jest.fn(),
                        createFaculty: jest.fn(),
                        createSetting: jest.fn(),
                        // Add model properties if needed for schema methods
                        facultyModel,
                        statusModel,
                        programModel,
                    },
                },
                { provide: ConfigService, useValue: configService },
                { provide: LoggerService, useValue: loggerService },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get<UserRepository>(UserRepository);
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
            // Mock the userRepository methods instead of model methods
            jest.spyOn(userRepository, 'findById').mockResolvedValue(
                fakeUser as unknown as User,
            );
            jest.spyOn(userRepository, 'findStatus').mockResolvedValue({
                name: 'Active',
            } as Status);
            jest.spyOn(userRepository, 'findProgram').mockResolvedValue({
                name: 'CS',
            } as Program);
            jest.spyOn(userRepository, 'findFaculty').mockResolvedValue({
                name: 'Engineering',
            } as Faculty);

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
            jest.spyOn(userRepository, 'findById').mockResolvedValue(null);
            await expect(
                service.getMyProfile({ id: '1' } as User),
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

    describe('updatePassword', () => {
        it('should update password successfully', async () => {
            // Arrange
            const email = 'user@example.com';
            const newPassword = 'newPassword';
            const hashedPassword = 'hashedPassword';

            jest.spyOn(service, 'hashPassword').mockResolvedValue(
                hashedPassword,
            );
            jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

            await service.updatePassword(email, newPassword);

            expect(service.hashPassword).toHaveBeenCalledWith(newPassword);
            expect(userRepository.update).toHaveBeenCalledWith(
                { email },
                {
                    password: hashedPassword,
                    otp: null,
                    otpExpiry: null,
                },
            );
        });

        it('should handle errors when hashing password', async () => {
            // Arrange
            const email = 'user@example.com';
            const newPassword = 'newPassword';

            jest.spyOn(service, 'hashPassword').mockRejectedValue(
                new Error('Hashing error'),
            );

            // Act & Assert
            await expect(
                service.updatePassword(email, newPassword),
            ).rejects.toThrow(InternalServerErrorException);

            // Verify update was not called
            expect(userRepository.update).not.toHaveBeenCalled();
        });

        it('should handle errors when updating password', async () => {
            // Arrange
            const email = 'user@example.com';
            const newPassword = 'newPassword';

            jest.spyOn(service, 'hashPassword').mockResolvedValue(
                'hashedPassword',
            );
            jest.spyOn(userRepository, 'update').mockRejectedValue(
                new Error('Database error'),
            );

            // Act & Assert
            await expect(
                service.updatePassword(email, newPassword),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('removeByStudentId', () => {
        it('should throw error if trying to delete admin account', async () => {
            // Arrange
            const adminUser = { role: Role.ADMIN, username: 'admin' } as User;
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(adminUser);

            // Act & Assert
            await expect(service.removeByStudentId('admin')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should delete a student and log operation within 10 minutes of creation', async () => {
            // Arrange
            const creationTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
            const studentUser = {
                role: Role.STUDENT,
                username: 'student',
                createdAt: creationTime, // Add createdAt property
            } as User;

            // Mock the necessary repository methods
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(
                studentUser,
            );
            jest.spyOn(userRepository, 'delete').mockResolvedValue(undefined);
            jest.spyOn(loggerService, 'logOperation').mockImplementation(
                jest.fn(),
            ); // Ensure logger is mocked
            jest.spyOn(userRepository, 'findAllSetting').mockResolvedValue([
                {
                    creationDeleteWindow: 10,
                },
            ] as Setting[]); // Mock findAllSetting to return a valid setting

            // Act
            await service.removeByStudentId('student');

            // Assert
            expect(userRepository.delete).toHaveBeenCalledWith({
                username: 'student',
            });
            expect(loggerService.logOperation).toHaveBeenCalled();
        });

        it('should throw error if student not found', async () => {
            // Arrange
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            // Act & Assert
            await expect(
                service.removeByStudentId('nonexistent'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('searchByNameOrStudentID', () => {
        it('should return matching users when found', async () => {
            // Arrange
            const searchTerm = 'test';
            const mockUsers = [
                {
                    id: '1',
                    username: 'test123',
                    fullname: 'Test User',
                    email: 'test@example.com',
                    faculty: 'Faculty of Japanese',
                    program: 'Formal Program',
                    status: 'Active',
                    role: Role.STUDENT,
                },
                {
                    id: '2',
                    username: '12345',
                    fullname: 'Testing Name',
                    email: 'testing@example.com',
                    faculty: 'Faculty of Japanese',
                    program: 'Formal Program',
                    status: 'Active',
                    role: Role.STUDENT,
                },
            ] as unknown as User[];

            jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

            // Act
            const result = await service.searchByNameOrStudentID(searchTerm);

            // Assert
            expect(userRepository.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    $or: [
                        { fullname: expect.any(Object) },
                        { username: expect.any(Object) },
                    ],
                }),
            );
            expect(result).toEqual(mockUsers);
        });

        it('should throw NotFoundException if no users found', async () => {
            // Arrange
            const searchTerm = 'nonexistent';
            jest.spyOn(userRepository, 'find').mockResolvedValue([]);

            // Act & Assert
            await expect(
                service.searchByNameOrStudentID(searchTerm),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('exportUsersJson', () => {
        it('should export users as JSON string', async () => {
            const users = [
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
            const fakeUsers = users.map((user) => ({
                ...user,
                password: 'password',
                refreshToken: null,
                otp: null,
                otpExpiry: null,
            })) as unknown as User[];
            jest.spyOn(service, 'findAll').mockResolvedValue(fakeUsers);
            const result = await service.exportUsersJson();
            expect(typeof result).toBe('string');
            expect(result).toContain('user1');
        });
    });

    describe('exportUsersCsv', () => {
        it('should export users as CSV string', async () => {
            const users = [
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
            const fakeUsers = users.map((user) => ({
                ...user,
                password: 'password',
                refreshToken: null,
                otp: null,
                otpExpiry: null,
            })) as unknown as User[];
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

    describe('findAll', () => {
        it('should return users from repository', async () => {
            const mockUsers = [
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
                    toObject: function () {
                        return this;
                    },
                },
            ] as unknown as User[];

            jest.spyOn(userRepository, 'find').mockResolvedValue(mockUsers);

            const result = await service.findAll();

            expect(userRepository.find).toHaveBeenCalledWith({});
            expect(result).toEqual(mockUsers);
        });

        it('should handle empty result', async () => {
            jest.spyOn(userRepository, 'find').mockResolvedValue([]);

            // If your service throws an error for empty results, test that:
            /*
            await expect(service.findAll()).rejects.toThrow(NotFoundException);
            */

            // If your service returns empty array, test that:
            const result = await service.findAll();
            expect(result).toEqual([]);
        });

        it('should propagate errors from repository', async () => {
            jest.spyOn(userRepository, 'find').mockRejectedValue(
                new Error('Database error'),
            );

            await expect(service.findAll()).rejects.toThrow('Database error');
        });
    });

    describe('updateRefreshToken', () => {
        it('should update refresh token successfully', async () => {
            // Arrange
            const username = 'user1';
            const refreshToken = 'newRefreshToken';
            jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

            // Act
            await service.updateRefreshToken(username, refreshToken);

            // Assert
            expect(userRepository.update).toHaveBeenCalledWith(
                { username },
                { refreshToken },
            );
        });

        it('should handle errors when updating refresh token', async () => {
            // Arrange
            const username = 'user1';
            const refreshToken = 'newRefreshToken';
            jest.spyOn(userRepository, 'update').mockRejectedValue(
                new Error('Database error'),
            );

            // Act & Assert
            await expect(
                service.updateRefreshToken(username, refreshToken),
            ).rejects.toThrow(InternalServerErrorException);
        });

        it('should handle null refresh token when logging out', async () => {
            // Arrange
            const username = 'user1';
            jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

            // Act
            await service.updateRefreshToken(username, null);

            // Assert
            expect(userRepository.update).toHaveBeenCalledWith(
                { username },
                { refreshToken: null },
            );
        });
    });

    describe('updateOtp', () => {
        it('should update OTP successfully', async () => {
            // Arrange
            const email = 'user@example.com';
            const otp = '123456';
            const otpExpiry = new Date();
            jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

            // Act
            await service.updateOtp(email, otp, otpExpiry);

            // Assert
            expect(userRepository.update).toHaveBeenCalledWith(
                { email },
                { otp, otpExpiry },
            );
        });

        it('should handle errors when updating OTP', async () => {
            // Arrange
            const email = 'user@example.com';
            const otp = '123456';
            const otpExpiry = new Date();
            jest.spyOn(userRepository, 'update').mockRejectedValue(
                new Error('Database error'),
            );

            // Act & Assert
            await expect(
                service.updateOtp(email, otp, otpExpiry),
            ).rejects.toThrow(InternalServerErrorException);
        });

        it('should handle update with null OTP for reset', async () => {
            // Arrange
            const email = 'user@example.com';
            jest.spyOn(userRepository, 'update').mockResolvedValue(undefined);

            // Act
            await service.updateOtp(email, null, null);

            // Assert
            expect(userRepository.update).toHaveBeenCalledWith(
                { email },
                { otp: null, otpExpiry: null },
            );
        });
    });

    describe('updateUniversitySettings', () => {
        it('should throw error if settings are already up to date', async () => {
            // Arrange
            const currentSettings = [
                { phonePrefix: '+84', emailSuffix: 'example.com' },
            ] as unknown as Setting[];
            jest.spyOn(userRepository, 'findAllSetting').mockResolvedValue(
                currentSettings,
            );

            // Act & Assert
            expect(userRepository.updateSetting).not.toHaveBeenCalled();
        });

        it('should update settings if different', async () => {
            // Arrange
            const currentSettings = [
                {
                    phonePrefix: '+84',
                    emailSuffix: 'old.com',
                    creationDeleteWindow: 10,
                },
            ] as unknown as Setting[];
            jest.spyOn(userRepository, 'findAllSetting').mockResolvedValue(
                currentSettings,
            );
            jest.spyOn(userRepository, 'updateSetting').mockResolvedValue(
                undefined,
            );

            // Act
            await service.updateUniversitySettings('84', 'new.com', 10);

            // Assert
            expect(userRepository.updateSetting).toHaveBeenCalledWith(
                {},
                {
                    phonePrefix: '+84',
                    emailSuffix: 'new.com',
                    creationDeleteWindow: 10,
                },
            );
            expect(loggerService.logOperation).toHaveBeenCalledWith(
                'INFO',
                'Updated university settings: old.com -> new.com, +84 -> 84, 10 -> 10',
            );
        });
    });

    describe('getUniversitySettings', () => {
        it('should return the university settings', async () => {
            // Arrange
            const mockSettings = [
                { phonePrefix: '+84', emailSuffix: 'example.com' },
            ] as unknown as Setting[];
            jest.spyOn(userRepository, 'findAllSetting').mockResolvedValue(
                mockSettings,
            );

            // Act
            const result = await service.getUniversitySettings();

            // Assert
            expect(userRepository.findAllSetting).toHaveBeenCalled();
            expect(result).toEqual(mockSettings[0]);
        });

        it('should throw NotFoundException if settings not found', async () => {
            // Arrange
            jest.spyOn(userRepository, 'findAllSetting').mockResolvedValue([]);

            // Act & Assert
            await expect(service.getUniversitySettings()).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateMultipleUsersByStudentID', () => {
        it('should update multiple users successfully', async () => {
            // Arrange
            const studentID = 'admin';
            const updateData = { status: 'Pending' };

            userRepository.findStatus = jest
                .fn()
                .mockResolvedValue({ _id: 's1', name: 'Active' });

            // Use valid ObjectId strings
            const validStatusId = new Types.ObjectId().toHexString();
            const validProgramId = new Types.ObjectId().toHexString();
            const validFacultyId = new Types.ObjectId().toHexString();

            // Mock the findById method to return a user object
            jest.spyOn(userRepository, 'findById').mockResolvedValue({
                id: studentID,
                username: studentID,
                email: 'test@test.com',
                password: 'password',
                refreshToken: null,
                otp: null,
                status: new Types.ObjectId(validStatusId),
                program: new Types.ObjectId(validProgramId),
                faculty: new Types.ObjectId(validFacultyId),
            } as User);

            jest.spyOn(userRepository, 'update').mockResolvedValue();

            // Act
            const updateResult = await service.updateMultipleUsersByStudentID([
                { id: studentID, updates: updateData },
            ]);

            // Assert
            expect(userRepository.findById).toHaveBeenCalledWith(studentID);
            expect(updateResult[0].status).toEqual('updated');
        });

        it('should throw error if no student IDs are provided', async () => {
            // Arrange
            const studentID: string = '2';
            const updateData = { status: 'Active' };

            // Act & Assert
            await expect(
                service.updateMultipleUsersByStudentID([
                    { id: studentID, updates: updateData },
                ]),
            ).rejects.toThrowError('Student with objectID 2 not found');
        });
    });

    describe('importUsers', () => {
        it('should throw BadRequestException if no file uploaded', async () => {
            await expect(service.importUsers(null)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should import users from JSON file', async () => {
            // Arrange
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

            userRepository.findStatus = jest
                .fn()
                .mockResolvedValue({ _id: 's1', name: 'Active' });
            userRepository.findProgram = jest
                .fn()
                .mockResolvedValue({ _id: 'p1', name: 'CS' });
            userRepository.findFaculty = jest
                .fn()
                .mockResolvedValue({ _id: 'f1', name: 'Engineering' });
            userRepository.insertMany = jest
                .fn()
                .mockResolvedValue([{ email: 'user@example.com' }]);

            // Act
            const result = await service.importUsers(file);

            // Assert
            expect(result).toBeDefined();
            expect(userRepository.insertMany).toHaveBeenCalled();
        });

        it('should import users from CSV file', async () => {
            // Arrange
            const csvContent = `email,status,program,faculty
user@example.com,Active,CS,Engineering`;
            const file = {
                mimetype: 'text/csv',
                buffer: Buffer.from(csvContent),
            } as Express.Multer.File;

            userRepository.findStatus = jest
                .fn()
                .mockResolvedValue({ _id: 's1', name: 'Active' });
            userRepository.findProgram = jest
                .fn()
                .mockResolvedValue({ _id: 'p1', name: 'CS' });
            userRepository.findFaculty = jest
                .fn()
                .mockResolvedValue({ _id: 'f1', name: 'Engineering' });
            userRepository.insertMany = jest
                .fn()
                .mockResolvedValue([{ email: 'user@example.com' }]);

            // Act
            const result = await service.importUsers(file);

            // Assert
            expect(result).toBeDefined();
            expect(userRepository.insertMany).toHaveBeenCalled();
        });

        it('should throw error for invalid file format', async () => {
            // Arrange
            const file = {
                mimetype: 'image/png',
                buffer: Buffer.from('test'),
            } as Express.Multer.File;

            // Act & Assert
            await expect(service.importUsers(file)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('changeStatusOrder', () => {
        it('should throw error if status not found', async () => {
            // Arrange
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            // Act & Assert
            await expect(
                service.changeStatusOrder('Nonexistent', 1),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw error if status already has that order', async () => {
            // Arrange
            userRepository.findStatus = jest
                .fn()
                .mockResolvedValue({ name: 'Active', order: 1 });

            // Act & Assert
            await expect(
                service.changeStatusOrder('Active', 1),
            ).rejects.toThrowError(
                `Status with name 'Active' already has order 1`,
            );
        });

        it('should update status order if valid', async () => {
            // Arrange
            userRepository.findStatus = jest
                .fn()
                .mockResolvedValue({ name: 'Active', order: 1 });
            userRepository.updateStatus = jest.fn().mockResolvedValue({});
            // Act
            await service.changeStatusOrder('Active', 2);

            // Assert
            expect(userRepository.updateStatus).toHaveBeenCalledWith(
                { name: 'Active' },
                { order: 2 },
            );
        });
    });

    describe('addStatusAttribute', () => {
        it('should add status attribute if not exists', async () => {
            // Arrange
            const statusName = 'Pending';
            const statusOrder = 1;
            userRepository.findStatus = jest.fn().mockResolvedValue(null);
            userRepository.createStatus = jest.fn();

            // Act
            await service.addStatusAttribute(statusName, statusOrder);

            // Assert
            expect(userRepository.createStatus).toHaveBeenCalledWith({
                name: statusName,
                order: statusOrder,
            });
        });

        it('should throw BadRequestException if status already exists', async () => {
            // Arrange
            const statusName = 'Pending';
            userRepository.findStatus = jest
                .fn()
                .mockResolvedValue({ name: statusName });

            // Act & Assert
            await expect(
                service.addStatusAttribute(statusName, 1),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('create', () => {
        it('should create a new user successfully', async () => {
            // Arrange
            const validStatusId = new Types.ObjectId().toHexString();
            const validProgramId = new Types.ObjectId().toHexString();
            const validFacultyId = new Types.ObjectId().toHexString();

            const dto = {
                username: 'user1',
                fullname: 'User One',
                birthday: '2000-01-01',
                gender: Gender.MALE,
                faculty: validFacultyId,
                classYear: 2020,
                program: validProgramId,
                address: 'address',
                email: 'user@example.com',
                password: 'password',
                phone: '1234567890',
                status: validStatusId,
                role: Role.STUDENT,
            };

            const mockStatus = { _id: validStatusId, name: 'Active' };
            const mockProgram = { _id: validProgramId, name: 'CS' };
            const mockFaculty = { _id: validFacultyId, name: 'Engineering' };

            const expectedUser = {
                _id: '1',
                username: dto.username,
                email: dto.email,
                fullname: dto.fullname,
                role: Role.STUDENT,
            };

            jest.spyOn(service, 'hashPassword').mockResolvedValue(
                'hashedPassword',
            );
            jest.spyOn(userRepository, 'findStatus').mockResolvedValue(
                mockStatus as Status,
            );
            jest.spyOn(userRepository, 'findProgram').mockResolvedValue(
                mockProgram as Program,
            );
            jest.spyOn(userRepository, 'findFaculty').mockResolvedValue(
                mockFaculty as Faculty,
            );
            jest.spyOn(userRepository, 'create').mockResolvedValue(
                expectedUser as unknown as User,
            );
            // Act
            const result = await service.create({
                ...dto,
                faculty: validFacultyId,
                program: validProgramId,
            });

            // Assert
            expect(service.hashPassword).toHaveBeenCalledWith(dto.password);
            expect(userRepository.findStatus).toHaveBeenCalledWith({
                name: 'Active',
            });
            expect(userRepository.findProgram).toHaveBeenCalledWith({
                name: dto.program,
            });
            expect(userRepository.findFaculty).toHaveBeenCalledWith({
                name: dto.faculty,
            });

            expect(userRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    username: dto.username,
                    email: dto.email,
                    password: 'hashedPassword',
                    birthday: expect.any(Date),
                    fullname: dto.fullname,
                    gender: dto.gender,
                    faculty: expect.any(Types.ObjectId),
                    classYear: dto.classYear,
                    program: expect.any(Types.ObjectId),
                    address: dto.address,
                    phone: dto.phone,
                    status: expect.any(Types.ObjectId),
                    role: Role.STUDENT,
                }),
            );

            expect(loggerService.logOperation).toHaveBeenCalled();
            expect(result).toEqual(expectedUser);
        });
    });
});

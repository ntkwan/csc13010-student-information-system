import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { Role } from '../../src/auth/enums/roles.enum';
import { Response } from 'express';
import { UpdateUsersDto } from './dtos/user-update.dto';
import { ATAuthGuard } from '../auth/guards/at-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AccessControlService } from '../shared/shared.service';

describe('UserController', () => {
    let userController: UserController;
    let userService: Record<string, jest.Mock>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                AccessControlService,
                {
                    provide: UserService,
                    useValue: {
                        create: jest.fn(),
                        removeByStudentId: jest.fn(),
                        getMyProfile: jest.fn(),
                        findAll: jest.fn(),
                        searchByNameOrStudentID: jest.fn(),
                        updateMultipleUsersByStudentID: jest.fn(),
                        updateUniversitySettings: jest.fn(),
                        getUniversitySettings: jest.fn(),
                        importUsers: jest.fn(),
                        exportUsersJson: jest.fn(),
                        exportUsersCsv: jest.fn(),
                        fetchAttributeSchema: jest.fn(),
                        changeAttributeName: jest.fn(),
                        addAttribute: jest.fn(),
                        changeStatusOrder: jest.fn(),
                        addStatusAttribute: jest.fn(),
                    },
                },
                {
                    provide: ATAuthGuard,
                    useValue: { canActivate: () => true },
                },
                {
                    provide: RolesGuard,
                    useValue: { canActivate: () => true },
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get(UserService);
    });

    describe('addStudent', () => {
        it('should add a new student and return profile', async () => {
            const newStudent = {
                email: 'student@example.com',
                username: 'student1',
                fullname: 'Student One',
                birthday: '2000-01-01',
                gender: 'MALE',
                faculty: 'Science',
                classYear: 2020,
                program: 'Computer Science',
                address: '123 Street',
                phone: '1234567890',
                status: 'active',
            };
            userService.create.mockResolvedValue(newStudent);
            const req = { body: newStudent };
            const res: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };

            await userController.addStudent(req, res as Response);
            expect(userService.create).toHaveBeenCalledWith(newStudent);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                email: newStudent.email,
                username: newStudent.username,
                fullname: newStudent.fullname,
                birthday: newStudent.birthday,
                gender: newStudent.gender,
                faculty: newStudent.faculty,
                classYear: newStudent.classYear,
                program: newStudent.program,
                address: newStudent.address,
                phone: newStudent.phone,
                status: newStudent.status,
            });
        });
    });

    describe('deleteStudent', () => {
        it('should delete a student and send success message', async () => {
            userService.removeByStudentId.mockResolvedValue(undefined);
            const res: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            const id = 'studentId';
            await userController.deleteStudent(id, res as Response);
            expect(userService.removeByStudentId).toHaveBeenCalledWith(id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Student deleted successfully',
            });
        });
    });

    describe('getMyProfile', () => {
        it('should return the user profile', async () => {
            const foundUser = {
                email: 'user@example.com',
                username: 'user1',
                id: '123',
            };
            userService.getMyProfile.mockResolvedValue(foundUser);
            const req = { user: { id: '123' } };
            const res: Partial<Response> = {
                send: jest.fn(),
            };
            await userController.getMyProfile(req, res as Response);
            expect(userService.getMyProfile).toHaveBeenCalledWith(req.user);
            expect(res.send).toHaveBeenCalledWith({
                email: foundUser.email,
                username: foundUser.username,
                id: foundUser.id,
            });
        });
    });

    describe('getAll', () => {
        it('should return all user profiles', async () => {
            const foundUsers = [
                {
                    id: '1',
                    username: 'user1',
                    fullname: 'User One',
                    birthday: '2000-01-01',
                    gender: 'MALE',
                    faculty: 'Science',
                    classYear: 2020,
                    program: 'CS',
                    address: '123',
                    email: 'user1@example.com',
                    phone: '1111111111',
                    status: 'active',
                    role: Role.ADMIN,
                },
            ];
            userService.findAll.mockResolvedValue(foundUsers);
            const req = {};
            const res: Partial<Response> = { send: jest.fn() };
            await userController.getAll(req, res as Response);
            expect(userService.findAll).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith(
                foundUsers.map((user) => ({
                    id: user.id,
                    username: user.username,
                    fullname: user.fullname,
                    birthday: user.birthday,
                    gender: user.gender,
                    faculty: user.faculty,
                    classYear: user.classYear,
                    program: user.program,
                    address: user.address,
                    email: user.email,
                    phone: user.phone,
                    status: user.status,
                    role: user.role,
                })),
            );
        });
    });

    describe('searchUsers', () => {
        it('should return search results based on query parameters', async () => {
            const users = [
                {
                    _id: '1',
                    username: 'user1',
                    fullname: 'User One',
                    birthday: '2000-01-01',
                    gender: 'MALE',
                    faculty: 'Science',
                    classYear: 2020,
                    program: 'CS',
                    address: '123',
                    email: 'user1@example.com',
                    phone: '1111111111',
                    status: 'active',
                    role: Role.ADMIN,
                },
            ];
            userService.searchByNameOrStudentID.mockResolvedValue(users);
            const result = await userController.searchUsers('user', 'Science');
            expect(userService.searchByNameOrStudentID).toHaveBeenCalledWith(
                'user',
                'Science',
            );
            expect(result).toEqual(
                users.map((user) => ({
                    id: user._id,
                    username: user.username,
                    fullname: user.fullname,
                    birthday: user.birthday,
                    gender: user.gender,
                    faculty: user.faculty,
                    classYear: user.classYear,
                    program: user.program,
                    address: user.address,
                    email: user.email,
                    phone: user.phone,
                    status: user.status,
                    role: user.role,
                })),
            );
        });
    });

    describe('updateUsers', () => {
        it('should throw BadRequestException if input is not a non-empty array', async () => {
            await expect(userController.updateUsers(null)).rejects.toThrow(
                BadRequestException,
            );
            await expect(userController.updateUsers([])).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if any record has no updates', async () => {
            const invalidPayload = [
                { id: '67b773e17e375218ae0d70d6', updates: {} },
            ];
            await expect(
                userController.updateUsers(invalidPayload),
            ).rejects.toThrow(BadRequestException);
        });

        it('should update multiple users and return update results', async () => {
            const payload: UpdateUsersDto[] = [
                {
                    id: '67b773e17e375218ae0d70d6',
                    updates: { fullname: 'Le Van A' },
                },
            ];
            const updateResults = [
                { id: '67b773e17e375218ae0d70d6', updated: true },
            ];
            userService.updateMultipleUsersByStudentID.mockResolvedValue(
                updateResults,
            );
            const result = await userController.updateUsers(payload);
            expect(
                userService.updateMultipleUsersByStudentID,
            ).toHaveBeenCalledWith(payload);
            expect(result).toEqual(updateResults);
        });
    });

    describe('updateSettings', () => {
        it('should update university settings and send a success message', async () => {
            userService.updateUniversitySettings.mockResolvedValue(null);
            const res: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            await userController.updateSettings(
                res as Response,
                '001',
                'example.com',
            );
            expect(userService.updateUniversitySettings).toHaveBeenCalledWith(
                '001',
                'example.com',
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Settings updated successfully',
            });
        });
    });

    describe('getSettings', () => {
        it('should fetch and send university settings', async () => {
            const settings = { phonePrefix: '001', emailSuffix: 'example.com' };
            userService.getUniversitySettings.mockResolvedValue(settings);
            const res: Partial<Response> = { send: jest.fn() };
            await userController.getSettings(res as Response);
            expect(userService.getUniversitySettings).toHaveBeenCalled();
            expect(res.send).toHaveBeenCalledWith(settings);
        });
    });

    describe('importUsers', () => {
        it('should import users and send the result with status 201', async () => {
            const file = { buffer: Buffer.from('test') } as Express.Multer.File;
            const importResult = { imported: 10 };
            userService.importUsers.mockResolvedValue(importResult);
            const res: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            await userController.importUsers(file, res as Response);
            expect(userService.importUsers).toHaveBeenCalledWith(file);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(importResult);
        });
    });

    describe('exportUsersJson', () => {
        it('should export users as JSON', async () => {
            const jsonData = JSON.stringify([{ id: 1, name: 'Test' }]);
            userService.exportUsersJson.mockResolvedValue(jsonData);
            const res: Partial<Response> = {
                setHeader: jest.fn(),
                send: jest.fn(),
            };
            await userController.exportUsersJson(res as Response);
            expect(userService.exportUsersJson).toHaveBeenCalled();
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename=users.json',
            );
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'application/json',
            );
            expect(res.send).toHaveBeenCalledWith(jsonData);
        });
    });

    describe('exportUsersCsv', () => {
        it('should export users as CSV', async () => {
            const csvData = 'id,name\n1,Test';
            userService.exportUsersCsv.mockResolvedValue(csvData);
            const res: Partial<Response> = {
                setHeader: jest.fn(),
                send: jest.fn(),
            };
            await userController.exportUsersCsv(res as Response);
            expect(userService.exportUsersCsv).toHaveBeenCalled();
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename=users.csv',
            );
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'text/csv',
            );
            expect(res.send).toHaveBeenCalledWith(csvData);
        });
    });

    describe('getAttributes', () => {
        it('should fetch and send attributes', async () => {
            const attributes = ['Science', 'Arts'];
            userService.fetchAttributeSchema.mockResolvedValue(attributes);
            const res: Partial<Response> = { send: jest.fn() };
            await userController.getAttributes('faculty', res as Response);
            expect(userService.fetchAttributeSchema).toHaveBeenCalledWith(
                'faculty',
            );
            expect(res.send).toHaveBeenCalledWith(attributes);
        });
    });

    describe('changeAttributeName', () => {
        it('should change attribute name and send a success message', async () => {
            userService.changeAttributeName.mockResolvedValue(null);
            const res: Partial<Response> = { send: jest.fn() };
            await userController.changeAttributeName(
                'faculty',
                'oldName',
                'newName',
                res as Response,
            );
            expect(userService.changeAttributeName).toHaveBeenCalledWith(
                'faculty',
                'oldName',
                'newName',
            );
            expect(res.send).toHaveBeenCalledWith({
                message: `Attribute faculty changed oldName to newName`,
            });
        });
    });

    describe('addAttribute', () => {
        it('should add an attribute and send a success message with status 201', async () => {
            userService.addAttribute.mockResolvedValue(null);
            const res: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            await userController.addAttribute(
                'faculty',
                'Engineering',
                res as Response,
            );
            expect(userService.addAttribute).toHaveBeenCalledWith(
                'faculty',
                'Engineering',
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                message: `Attribute faculty added successfully`,
            });
        });
    });

    describe('changeStatusOrder', () => {
        it('should change status order and send a success message', async () => {
            userService.changeStatusOrder.mockResolvedValue(null);
            const res: Partial<Response> = { send: jest.fn() };
            await userController.changeStatusOrder(
                'Active',
                1,
                res as Response,
            );
            expect(userService.changeStatusOrder).toHaveBeenCalledWith(
                'Active',
                1,
            );
            expect(res.send).toHaveBeenCalledWith({
                message: `Status Active order changed to 1`,
            });
        });
    });

    describe('addStatusAttribute', () => {
        it('should add a status attribute and send a success message with status 201', async () => {
            userService.addStatusAttribute.mockResolvedValue(null);
            const res: Partial<Response> = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            await userController.addStatusAttribute(
                'Active',
                1,
                res as Response,
            );
            expect(userService.addStatusAttribute).toHaveBeenCalledWith(
                'Active',
                1,
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith({
                message: `Status Active added successfully`,
            });
        });
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserRepository } from './user.repository';
import { User } from '../entities/user.entity';
import {
    Faculty,
    Program,
    Setting,
    Status,
} from '../entities/attributes.entity';
import { NotFoundException } from '@nestjs/common';

const mockModel = () => ({
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    deleteOne: jest.fn(),
    exec: jest.fn(),
});

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let userModel: any;
    let facultyModel: any;
    let statusModel: any;
    let programModel: any;
    let settingModel: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                { provide: getModelToken(User.name), useFactory: mockModel },
                { provide: getModelToken(Faculty.name), useFactory: mockModel },
                { provide: getModelToken(Status.name), useFactory: mockModel },
                { provide: getModelToken(Program.name), useFactory: mockModel },
                { provide: getModelToken(Setting.name), useFactory: mockModel },
            ],
        }).compile();

        userRepository = module.get<UserRepository>(UserRepository);
        userModel = module.get(getModelToken(User.name));
        facultyModel = module.get(getModelToken(Faculty.name));
        statusModel = module.get(getModelToken(Status.name));
        programModel = module.get(getModelToken(Program.name));
        settingModel = module.get(getModelToken(Setting.name));
    });

    it('should be defined', () => {
        expect(userRepository).toBeDefined();
    });

    describe('findById', () => {
        it('should return a user if found', async () => {
            const mockUser = { id: '123', username: 'test' };
            userModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await userRepository.findById('123');
            expect(result).toEqual(mockUser);
            expect(userModel.findById).toHaveBeenCalledWith('123');
        });
    });

    describe('findOne', () => {
        it('should return a user matching query', async () => {
            const mockUser = { id: '123', username: 'test' };
            userModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUser),
            });

            const result = await userRepository.findOne({ username: 'test' });
            expect(result).toEqual(mockUser);
            expect(userModel.findOne).toHaveBeenCalledWith({
                username: 'test',
            });
        });
    });

    describe('find', () => {
        it('should return transformed users if found', async () => {
            const mockUsers = [
                {
                    id: '123',
                    username: 'test',
                    faculty: '1',
                    status: '2',
                    program: '3',
                },
            ];
            const mockStatus = { name: 'Active' };
            const mockProgram = { name: 'Engineering' };
            const mockFaculty = { name: 'Science' };

            userModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUsers),
            });
            statusModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockStatus),
            });
            programModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockProgram),
            });
            facultyModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockFaculty),
            });

            const result = await userRepository.find({});
            expect(result).toEqual([
                {
                    username: 'test',
                    fullname: undefined,
                    birthday: undefined,
                    gender: undefined,
                    faculty: 'Science',
                    classYear: undefined,
                    program: 'Engineering',
                    address: null,
                    email: undefined,
                    phone: null,
                    status: 'Active',
                    id: '123',
                    role: undefined,
                },
            ]);
        });

        it('should throw NotFoundException if no users found', async () => {
            userModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
            });

            await expect(userRepository.find({})).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const mockUser = { id: '123', username: 'test' };
            userModel.create.mockResolvedValue(mockUser);

            const result = await userRepository.create({ username: 'test' });
            expect(result).toEqual(mockUser);
            expect(userModel.create).toHaveBeenCalledWith({ username: 'test' });
        });
    });

    describe('delete', () => {
        it('should delete a user', async () => {
            userModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            });

            await userRepository.delete({ id: '123' });
            expect(userModel.deleteOne).toHaveBeenCalledWith({ id: '123' });
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            userModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await userRepository.update({ id: '123' }, { username: 'updated' });
            expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                { id: '123' },
                { username: 'updated' },
            );
        });
    });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../entities/user.entity';
import {
    Faculty,
    Program,
    Setting,
    Status,
} from '../entities/attributes.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name)
        readonly userModel: Model<User>,
        @InjectModel(Faculty.name)
        readonly facultyModel: Model<Faculty>,
        @InjectModel(Status.name)
        readonly statusModel: Model<Status>,
        @InjectModel(Program.name)
        readonly programModel: Model<Program>,
        @InjectModel(Setting.name)
        private readonly settingModel: Model<Setting>,
    ) {}

    async findById(id: string): Promise<User> {
        return this.userModel.findById(id).exec();
    }

    async findOne(query: any): Promise<User> {
        console.log(query);
        return this.userModel.findOne(query).exec();
    }

    async findFaculty(query: any): Promise<Faculty> {
        return this.facultyModel.findOne(query).exec();
    }

    async findStatus(query: any): Promise<Status> {
        return this.statusModel.findOne(query).exec();
    }

    async updateStatus(query: any, update: any): Promise<void> {
        await this.statusModel.findOneAndUpdate(query, update).exec();
    }

    async findProgram(query: any): Promise<Program> {
        return this.programModel.findOne(query).exec();
    }

    async findSetting(query: any): Promise<Setting> {
        return this.settingModel.findOne(query).exec();
    }

    async findAllSetting(): Promise<Setting[]> {
        return this.settingModel.find().exec();
    }

    async updateSetting(query: any, update: any): Promise<void> {
        await this.settingModel.findOneAndUpdate(query, update).exec();
    }

    async createFaculty(faculty: Partial<Faculty>): Promise<Faculty> {
        return this.facultyModel.create(faculty);
    }

    async createStatus(status: Partial<Status>): Promise<Status> {
        return this.statusModel.create(status);
    }

    async createProgram(program: Partial<Program>): Promise<Program> {
        return this.programModel.create(program);
    }

    async createSetting(setting: Partial<Setting>): Promise<Setting> {
        return this.settingModel.create(setting);
    }

    async find(query: any): Promise<any> {
        const users = await this.userModel.find(query).exec();
        if (!users.length) {
            throw new NotFoundException('No users found');
        }

        const newUsers = await Promise.all(
            users.map(async (user) => {
                const foundStatus = await this.findStatus({
                    _id: user.status,
                });
                const foundProgram = await this.findProgram({
                    _id: user.program,
                });
                const foundFaculty = await this.findFaculty({
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

    async create(user: Partial<User>): Promise<User> {
        return this.userModel.create(user);
    }

    async update(query: any, update: any): Promise<void> {
        await this.userModel.findOneAndUpdate(query, update).exec();
    }

    async insertMany(users: User[]): Promise<void> {
        await this.userModel.insertMany(users);
    }

    async delete(query: any): Promise<void> {
        await this.userModel.deleteOne(query).exec();
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Faculty,
    Program,
    Setting,
    Status,
} from './entities/attributes.entity';

@Injectable()
export class AttributesRepository {
    constructor(
        @InjectModel(Faculty.name)
        readonly facultyModel: Model<Faculty>,
        @InjectModel(Status.name)
        readonly statusModel: Model<Status>,
        @InjectModel(Program.name)
        readonly programModel: Model<Program>,
        @InjectModel(Setting.name)
        private readonly settingModel: Model<Setting>,
    ) {}

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
}

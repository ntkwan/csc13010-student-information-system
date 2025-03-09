import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
    ) {}

    async findById(id: string): Promise<User> {
        return this.userModel.findById(id).exec();
    }

    async findOne(query: any): Promise<User> {
        return this.userModel.findOne(query).exec();
    }

    async find(query: any): Promise<User[]> {
        return this.userModel.find(query).exec();
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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../auth/enums/roles.enum';
import { Faculty, Status, Gender, Program } from '../enums/student.enum';

@Schema({
    timestamps: true,
    collection: 'users',
})
export class User extends Document {
    // Credentials
    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    username: string; // Student ID

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    email: string; // Personal email

    @Prop({
        type: String,
        required: true,
    })
    password: string;

    @Prop({
        type: String,
        required: false,
    })
    refreshToken: string;

    @Prop({
        type: String,
        required: false,
    })
    otp: string;

    @Prop({
        type: Date,
        required: false,
    })
    otpExpiry: Date;

    // Personal information
    @Prop({
        type: String,
        required: true,
    })
    fullname: string;

    @Prop({
        type: Date,
        required: false,
    })
    birthday: Date;

    @Prop({
        type: String,
        enum: Object.values(Gender),
        required: true,
        default: Gender.NULL,
    })
    gender: Gender;

    @Prop({
        type: String,
        enum: Object.values(Faculty),
        required: true,
        default: Faculty.NULL,
    })
    faculty: Faculty;

    @Prop({
        type: Number,
        required: true,
        default: () => new Date().getFullYear(),
    })
    classYear: number;

    @Prop({
        type: String,
        enum: Object.values(Program),
        required: true,
        default: Program.NULL,
    })
    program: Program;

    @Prop({
        type: String,
        required: false,
    })
    address: string;

    @Prop({
        type: String,
        required: false,
        unique: true,
    })
    phone: string;

    @Prop({
        type: String,
        enum: Object.values(Status),
        required: true,
        default: Status.NULL,
    })
    status: Status;

    @Prop({
        type: String,
        enum: Object.values(Role),
        required: true,
        default: Role.STUDENT,
    })
    role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);

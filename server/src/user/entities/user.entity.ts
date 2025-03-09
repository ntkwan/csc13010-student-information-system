import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from '../../auth/enums/roles.enum';
import { Gender } from '../enums/student.enum';

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
        type: Types.ObjectId,
        ref: 'Faculty',
        required: true,
        default: null,
    })
    faculty: Types.ObjectId;

    @Prop({
        type: Number,
        required: true,
        default: () => new Date().getFullYear(),
    })
    classYear: number;

    @Prop({
        type: Types.ObjectId,
        ref: 'Program',
        required: true,
        default: null,
    })
    program: Types.ObjectId;

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
        type: Types.ObjectId,
        ref: 'Status',
        required: true,
        default: null,
    })
    status: Types.ObjectId;

    @Prop({
        type: String,
        enum: Object.values(Role),
        required: true,
        default: Role.STUDENT,
    })
    role: Role;

    @Prop({
        type: Date,
        required: true,
        default: new Date(),
    })
    createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

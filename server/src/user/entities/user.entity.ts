import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../auth/enums/roles.enum';

@Schema({
    timestamps: true,
    collection: 'users',
})
export class User extends Document {
    @Prop({
        type: String,
        required: true,
    })
    username: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
    })
    email: string;

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
        type: Date,
        required: true,
    })
    birthdate: Date;

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

    @Prop({
        type: String,
        enum: Object.values(Role),
        required: true,
        default: Role.USER,
    })
    role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);

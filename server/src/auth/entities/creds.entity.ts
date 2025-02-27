import { ApiProperty } from '@nestjs/swagger';
import {
    IsAlpha,
    IsAlphanumeric,
    IsDateString,
    IsEmail,
    IsEnum,
    IsMongoId,
    IsNumber,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { Gender } from '../../user/enums/student.enum';

export class CredEntity {
    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsString()
    email: string;
}

export class ProfileEntity {
    @ApiProperty()
    @IsString()
    readonly role: string;

    @ApiProperty()
    @IsString()
    @IsAlphanumeric()
    readonly username: string; // Student ID

    @ApiProperty()
    @IsString()
    @IsAlpha()
    readonly fullname: string;

    @ApiProperty()
    @IsDateString()
    readonly birthday: string;

    @ApiProperty()
    @IsString()
    @IsEnum(Gender)
    readonly gender: Gender;

    @ApiProperty()
    @IsMongoId({ message: 'Invalid faculty ID' })
    readonly faculty: string;

    @ApiProperty()
    @IsNumber()
    readonly classYear: number;

    @ApiProperty()
    @IsMongoId({ message: 'Invalid program ID' })
    readonly program: string;

    @ApiProperty()
    @IsString()
    readonly address: string;

    @ApiProperty()
    @IsString()
    @IsEmail({}, { message: 'Invalid email' })
    readonly email: string;

    @ApiProperty()
    @IsString()
    @IsPhoneNumber('VN', { message: 'Invalid phone number' })
    readonly phone: string;

    @ApiProperty()
    @IsMongoId({ message: 'Invalid status ID' })
    readonly status: string;
}

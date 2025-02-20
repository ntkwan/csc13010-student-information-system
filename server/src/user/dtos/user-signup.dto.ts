import {
    IsAlpha,
    IsAlphanumeric,
    IsDateString,
    IsEmail,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { Gender } from '../enums/student.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UserSignUpDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Username cannot be empty' })
    @IsString()
    @IsAlphanumeric()
    readonly username: string; // Student ID

    @ApiProperty()
    @IsNotEmpty({ message: 'Fullname cannot be empty' })
    @IsString()
    @IsAlpha()
    readonly fullname: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Birthday cannot be empty' })
    @IsDateString()
    readonly birthday: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Gender cannot be empty' })
    @IsString()
    @IsEnum(Gender)
    readonly gender: Gender;

    @ApiProperty()
    @IsNotEmpty({ message: 'Faculty cannot be empty' })
    @IsMongoId({ message: 'Invalid faculty ID' })
    readonly faculty: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Class cannot be empty' })
    @IsNumber()
    readonly classYear: number;

    @ApiProperty()
    @IsNotEmpty({ message: 'Program cannot be empty' })
    @IsMongoId({ message: 'Invalid program ID' })
    readonly program: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Address cannot be empty' })
    @IsString()
    readonly address: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsString()
    @IsEmail({}, { message: 'Invalid email' })
    readonly email: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString()
    readonly password: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Phone cannot be empty' })
    @IsString()
    @IsPhoneNumber('VN', { message: 'Invalid phone number' })
    readonly phone: string;
}

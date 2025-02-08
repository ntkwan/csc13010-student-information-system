import { ApiProperty } from '@nestjs/swagger';
import {
    IsAlpha,
    IsAlphanumeric,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNumber,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { Faculty, Gender, Program, Status } from 'src/user/enums/student.enum';

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
    @IsString()
    @IsEnum(Faculty)
    readonly faculty: Faculty;

    @ApiProperty()
    @IsNumber()
    readonly classYear: number;

    @ApiProperty()
    @IsString()
    @IsEnum(Program)
    readonly program: Program;

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
    @IsString()
    @IsEnum(Status)
    readonly status: Status;
}

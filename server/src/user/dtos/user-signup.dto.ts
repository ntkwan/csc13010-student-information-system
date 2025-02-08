import {
    IsAlpha,
    IsAlphanumeric,
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsPhoneNumber,
    IsString,
} from 'class-validator';
import { Faculty, Gender, Program } from '../enums/student.enum';

export class UserSignUpDto {
    @IsNotEmpty({ message: 'Username cannot be empty' })
    @IsString()
    @IsAlphanumeric()
    readonly username: string; // Student ID

    @IsNotEmpty({ message: 'Fullname cannot be empty' })
    @IsString()
    @IsAlpha()
    readonly fullname: string;

    @IsNotEmpty({ message: 'Birthday cannot be empty' })
    @IsDateString()
    readonly birthday: string;

    @IsNotEmpty({ message: 'Gender cannot be empty' })
    @IsString()
    @IsEnum(Gender)
    readonly gender: Gender;

    @IsNotEmpty({ message: 'Faculty cannot be empty' })
    @IsString()
    @IsEnum(Faculty)
    readonly faculty: Faculty;

    @IsNotEmpty({ message: 'Class cannot be empty' })
    @IsNumber()
    readonly classYear: number;

    @IsNotEmpty({ message: 'Program cannot be empty' })
    @IsString()
    @IsEnum(Program)
    readonly program: Program;

    @IsNotEmpty({ message: 'Address cannot be empty' })
    @IsString()
    readonly address: string;

    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsString()
    @IsEmail({}, { message: 'Invalid email' })
    readonly email: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString()
    readonly password: string;

    @IsNotEmpty({ message: 'Phone cannot be empty' })
    @IsString()
    @IsPhoneNumber('VN', { message: 'Invalid phone number' })
    readonly phone: string;
}

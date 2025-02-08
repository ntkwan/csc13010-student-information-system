import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserSignUpDto {
    @IsNotEmpty({ message: 'Username cannot be empty' })
    @IsString()
    readonly username: string;

    @IsNotEmpty({ message: 'Email cannot be empty' })
    @IsEmail({}, { message: 'Invalid email' })
    readonly email: string;

    @IsNotEmpty({ message: 'Password cannot be empty' })
    @IsString()
    readonly password: string;

    @IsNotEmpty({ message: 'Birthdate cannot be empty' })
    @IsDateString()
    readonly birthdate: string;
}

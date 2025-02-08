import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UserLoginDto {
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsOptional()
    username: string;

    @IsString()
    @MinLength(4)
    password: string;
}

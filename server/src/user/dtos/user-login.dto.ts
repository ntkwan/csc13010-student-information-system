import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UserLoginDto {
    @ApiProperty({
        description: 'Email of the user',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty({
        description: 'Username of the user',
        required: false,
    })
    @IsString()
    @IsOptional()
    username: string;

    @ApiProperty({
        description: 'Password of the user',
        required: true,
    })
    @IsString()
    @MinLength(4)
    password: string;
}

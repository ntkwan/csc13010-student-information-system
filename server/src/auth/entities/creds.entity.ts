import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

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
    email: string;

    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsDateString()
    birthdate: string;

    @ApiProperty()
    @IsString()
    role: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Role } from '../enums/roles.enum';

export class ChangeRoleDto {
    @ApiProperty()
    @IsString()
    role: Role;
}

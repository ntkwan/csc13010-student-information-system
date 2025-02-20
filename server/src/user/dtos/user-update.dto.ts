import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../enums/student.enum';
import { Types } from 'mongoose';

export class UpdateUsersDto {
    @ApiProperty({
        description: 'Mongo ID of the user to update',
    })
    id: string;

    @ApiProperty({
        description: 'Partial update object with at least one field to update',
        example: { fullname: 'new.fullname', email: 'new.email@email.com' },
        minProperties: 1, // Swagger property to hint at least one field required
    })
    updates: Partial<{
        username: string;
        email: string;
        birthday?: Date;
        fullname: string;
        gender: Gender;
        faculty: Types.ObjectId;
        classYear: number;
        program: Types.ObjectId;
        address?: string;
        phone: string;
        status: Types.ObjectId;
    }>;
}
export class UpdateResultDto {
    @ApiProperty({
        description: 'Student ID of the student that was updated',
        example: '22127000',
    })
    username: string;

    @ApiProperty({
        description: 'Status of the update operation',
        example: 'updated',
    })
    status: string;

    @ApiProperty({
        description: 'Error message (if any)',
        example: 'Validation failed',
        required: false,
    })
    message?: string;
}

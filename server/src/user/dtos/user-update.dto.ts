import { ApiProperty } from '@nestjs/swagger';
import { Gender, Faculty, Program, Status } from '../enums/student.enum';

export class UpdateUsersDto {
    @ApiProperty({
        description: 'Unique ID of the user to update',
        example: '63f7c92e8b5e4a5d2c70f00e',
    })
    id: string;

    @ApiProperty({
        description: 'Partial update object with at least one field to update',
        example: { username: 'new.username', email: 'new.email@email.com' },
        minProperties: 1, // Swagger property to hint at least one field required
    })
    updates: Partial<{
        username?: string;
        email?: string;
        birthday?: Date;
        fullname?: string;
        gender?: Gender;
        faculty?: Faculty;
        classYear?: number;
        program?: Program;
        address?: string;
        phone?: string;
        status?: Status;
    }>;
}
export class UpdateResultDto {
    @ApiProperty({
        description: 'ID of the user that was updated',
        example: '63f7c92e8b5e4a5d2c70f00e',
    })
    id: string;

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

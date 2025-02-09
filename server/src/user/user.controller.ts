import {
    Controller,
    UseGuards,
    Request,
    Res,
    Get,
    BadRequestException,
    Query,
    Post,
    Body,
    Put,
    Delete,
    Param,
} from '@nestjs/common';
import { Response } from 'express';
import { ATAuthGuard } from '../auth/guards/at-auth.guard';
import {
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import { ProfileEntity } from '../auth/entities/creds.entity';
import { UserService } from './user.service';
import { Role } from 'src/auth/enums/roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from './entities/user.entity';
import { UpdateResultDto, UpdateUsersDto } from './dtos/user-update.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserSignUpDto } from './dtos/user-signup.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @ApiOperation({ summary: 'Add a new student [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Post('user')
    @ApiBody({ type: UserSignUpDto })
    @ApiResponse({
        status: 201,
        description: 'Student added successfully',
        type: ProfileEntity,
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async addStudent(@Request() req: UserSignUpDto, @Res() res: Response) {
        const newStudent = await this.userService.create(req);
        res.status(201).send({
            email: newStudent.email,
            username: newStudent.username,
            fullname: newStudent.fullname,
            birthday: newStudent.birthday,
            gender: newStudent.gender,
            faculty: newStudent.faculty,
            classYear: newStudent.classYear,
            program: newStudent.program,
            address: newStudent.address,
            phone: newStudent.phone,
            status: newStudent.status,
        });
    }

    @ApiOperation({ summary: 'Delete a student [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Delete('user/:id')
    @ApiResponse({
        status: 200,
        description: 'Student deleted successfully',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async deleteStudent(@Param('id') id: string, @Res() res: Response) {
        await this.userService.removeById(id);
        res.status(200).send({
            message: 'Student deleted successfully',
        });
    }

    @ApiOperation({ summary: 'Get profile with credentials [USER]' })
    @ApiBearerAuth('access-token')
    @Get('user')
    @ApiResponse({
        status: 200,
        description: 'Get profile successfully',
        type: ProfileEntity,
    })
    @UseGuards(ATAuthGuard)
    async getMyProfile(@Request() req: any, @Res() res: Response) {
        const foundUser = await this.userService.getMyProfile(req.user);
        res.send({
            email: foundUser.email,
            username: foundUser.username,
            id: foundUser.id,
        });
    }

    @ApiOperation({ summary: 'Get all user profiles with credentials [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Get()
    @ApiResponse({
        status: 200,
        description: 'Get all profiles successfully',
        type: [ProfileEntity],
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async getAll(@Request() req: any, @Res() res: Response) {
        const foundUsers: User[] = await this.userService.findAll();
        res.send(
            foundUsers.map((user) => ({
                id: user._id,
                email: user.email,
                username: user.username,
                birthday: user.birthday,
                role: user.role,
            })),
        );
    }

    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Search users by name [ADMIN]' })
    @ApiResponse({
        status: 200,
        description: 'Search users successfully',
        type: [ProfileEntity],
    })
    @UseGuards(RolesGuard)
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    @Get('search')
    async searchUsers(@Query('name') name: string) {
        if (!name) {
            throw new BadRequestException('Query parameter "name" is required');
        }

        const users = await this.userService.searchByNameOrStudentID(name);
        return users.map((user) => ({
            id: user._id,
            username: user.username,
            email: user.email,
            birthday: user.birthday,
        }));
    }

    @ApiBearerAuth('access-token')
    @UseGuards(RolesGuard)
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    @Put()
    @ApiOperation({
        summary: 'Update multiple user records [ADMIN]',
        description:
            'Accepts a payload of multiple records to update. Each record must have a valid `id` and an `updates` object with at least one field to update. Throws an error if a record does not exist.',
    })
    @ApiBody({
        type: [UpdateUsersDto],
        description: 'Array of records containing the user ID and updates',
        examples: {
            validPayload: {
                summary: 'Valid payload',
                value: [
                    {
                        id: '63f7c92e8b5e4a5d2c70f00e',
                        updates: {
                            username: 'new.username',
                        },
                    },
                    {
                        id: '63f7c92e8b5e4a5d2c70f00f',
                        updates: {
                            email: 'new.email@email.com',
                        },
                    },
                ],
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Returns an array of update results',
        type: [UpdateResultDto],
    })
    @ApiResponse({
        status: 400,
        description: 'Input validation failed',
    })
    async updateUsers(
        @Body() users: UpdateUsersDto[],
    ): Promise<UpdateResultDto[]> {
        console.log(users);
        if (!Array.isArray(users) || users.length === 0) {
            throw new BadRequestException(
                'Input must be a non-empty array of records',
            );
        }

        users.forEach((user) => {
            if (!user.updates || Object.keys(user.updates).length === 0) {
                throw new BadRequestException(
                    `Each record must have at least one field to update`,
                );
            }
        });

        return await this.userService.updateMultipleUsers(users);
    }
}

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
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ATAuthGuard } from '../auth/guards/at-auth.guard';
import {
    ApiResponse,
    ApiOperation,
    ApiBearerAuth,
    ApiBody,
    ApiQuery,
    ApiConsumes,
} from '@nestjs/swagger';
import { ProfileEntity } from '../auth/entities/creds.entity';
import { UserService } from './user.service';
import { Role } from '../auth/enums/roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateResultDto, UpdateUsersDto } from './dtos/user-update.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

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
    async addStudent(@Request() req: any, @Res() res: Response) {
        const newStudent = await this.userService.create(req.body);
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
        await this.userService.removeByStudentId(id);
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
        const foundUsers = await this.userService.findAll();
        res.send(
            foundUsers.map((user) => ({
                id: user.id,
                username: user.username,
                fullname: user.fullname,
                birthday: user.birthday,
                gender: user.gender,
                faculty: user.faculty,
                classYear: user.classYear,
                program: user.program,
                address: user.address,
                email: user.email,
                phone: user.phone,
                status: user.status,
                role: user.role,
            })),
        );
    }

    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Search users by name or student ID [ADMIN]' })
    @ApiResponse({
        status: 200,
        description: 'Search users successfully',
        type: [ProfileEntity],
    })
    @UseGuards(RolesGuard)
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    @Get('search')
    @ApiQuery({
        name: 'name',
        required: false,
        description: 'Search by name or student ID',
    })
    @ApiQuery({
        name: 'faculty',
        required: false,
        description: 'Filter by faculty',
    })
    async searchUsers(
        @Query('name') name?: string,
        @Query('faculty') faculty?: string,
    ) {
        const users = await this.userService.searchByNameOrStudentID(
            name || '',
            faculty || '',
        );
        return users.map((user) => ({
            id: user._id,
            username: user.username,
            fullname: user.fullname,
            birthday: user.birthday,
            gender: user.gender,
            faculty: user.faculty,
            classYear: user.classYear,
            program: user.program,
            address: user.address,
            email: user.email,
            phone: user.phone,
            status: user.status,
            role: user.role,
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
            'Accepts a payload of multiple records to update. Each record must have a valid `username` (Student ID) and an `updates` object with at least one field to update. Throws an error if a record does not exist.',
    })
    @ApiBody({
        type: [UpdateUsersDto],
        description: 'Array of records containing the user ID and updates',
        examples: {
            validPayload: {
                summary: 'Valid payload',
                value: [
                    {
                        username: '22127000',
                        updates: {
                            fullname: 'new.fullname',
                        },
                    },
                    {
                        username: '22127001',
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

        return await this.userService.updateMultipleUsersByStudentID(users);
    }

    @ApiOperation({ summary: 'Update university settings [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Put('settings')
    @ApiResponse({
        status: 200,
        description: 'Settings updated successfully',
    })
    @ApiQuery({
        name: 'phonePrefix',
        required: false,
        description: 'Phone prefix',
    })
    @ApiQuery({
        name: 'emailSuffix',
        required: false,
        description: 'Email suffix',
    })
    @ApiQuery({
        name: 'creationDeleteWindow',
        required: false,
        description: 'Creation delete window',
    })
    @ApiQuery({
        name: 'enableValidation',
        required: false,
        description: 'Enable validation',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async updateSettings(
        @Res() res: Response,
        @Query('phonePrefix') phonePrefix?: string,
        @Query('emailSuffix') emailSuffix?: string,
        @Query('creationDeleteWindow') creationDeleteWindow?: number,
        @Query('enableValidation') enableValidation?: boolean,
    ) {
        await this.userService.updateUniversitySettings(
            phonePrefix,
            emailSuffix,
            creationDeleteWindow,
            enableValidation,
        );
        res.status(200).send({
            message: 'Settings updated successfully',
        });
    }

    @ApiOperation({ summary: 'Get university settings [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Get('settings')
    @ApiResponse({
        status: 200,
        description: 'Settings fetched successfully',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async getSettings(@Res() res: Response) {
        const settings = await this.userService.getUniversitySettings();
        res.send(settings);
    }

    @ApiOperation({ summary: 'Import users from JSON/CSV file [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Post('import')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'CSV or JSON file',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Users imported successfully',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(
        FileInterceptor('file', { storage: multer.memoryStorage() }),
    )
    async importUsers(
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        const result = await this.userService.importUsers(file);
        res.status(201).send(result);
    }

    @ApiOperation({ summary: 'Export all users as JSON [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Get('export/json')
    @ApiResponse({
        status: 200,
        description: 'Users exported successfully',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async exportUsersJson(@Res() res: Response) {
        const jsonData = await this.userService.exportUsersJson();
        res.setHeader('Content-Disposition', 'attachment; filename=users.json');
        res.setHeader('Content-Type', 'application/json');
        res.send(jsonData);
    }

    @ApiOperation({ summary: 'Export all users as CSV [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Get('export/csv')
    @ApiResponse({
        status: 200,
        description: 'Users exported successfully',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async exportUsersCsv(@Res() res: Response) {
        const csvData = await this.userService.exportUsersCsv();
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.send(csvData);
    }

    @ApiOperation({ summary: 'Export student certificate [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Get('export/certificate/:id')
    @ApiResponse({
        status: 200,
        description: 'Student certificate exported successfully',
    })
    @ApiQuery({
        name: 'format',
        required: true,
        description: 'Format of the certificate (pdf or docx)',
    })
    @ApiQuery({
        name: 'purpose',
        required: true,
        enum: ['loan', 'military', 'job', 'other'],
        description: 'Purpose of the certificate',
    })
    @ApiQuery({
        name: 'otherReason',
        required: false,
        description:
            'Custom reason if purpose is "other" (URL-encoded for long text)',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async exportStudentCertificate(
        @Query('format') format: 'pdf' | 'docx',
        @Query('purpose') purpose: 'loan' | 'military' | 'job' | 'other',
        @Query('otherReason') otherReason: string,
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const certificateData = await this.userService.exportStudentCertificate(
            format,
            id,
            purpose,
            otherReason,
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=certificate.${format}`,
        );
        res.setHeader('Content-Type', `application/${format}`);
        res.send(certificateData);
    }

    @ApiOperation({ summary: 'Get the specific attribute [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Get('attributes')
    @ApiResponse({
        status: 200,
        description: 'Get attributes successfully',
    })
    @ApiQuery({
        name: 'attribute',
        required: true,
        description: 'Fetch a specific attribute [ex: faculty]',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async getAttributes(
        @Query('attribute') attribute: string,
        @Res() res: Response,
    ) {
        const attributes =
            await this.userService.fetchAttributeSchema(attribute);
        res.send(attributes);
    }

    @ApiOperation({ summary: 'Change name of the attribute [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Put('attribute')
    @ApiResponse({
        status: 200,
        description: 'Attribute name changed successfully',
    })
    @ApiQuery({
        name: 'attribute',
        required: true,
        description: 'Attribute to change',
    })
    @ApiQuery({
        name: 'newName',
        required: true,
        description: 'New name for the attribute',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async changeAttributeName(
        @Query('attribute') attribute: string,
        @Query('oldName') oldName: string,
        @Query('newName') newName: string,
        @Res() res: Response,
    ) {
        await this.userService.changeAttributeName(attribute, oldName, newName);
        res.send({
            message: `Attribute ${attribute} changed ${oldName} to ${newName}`,
        });
    }

    @ApiOperation({ summary: 'Add new attribute [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Post('attribute')
    @ApiResponse({
        status: 201,
        description: 'Attribute added successfully',
    })
    @ApiQuery({
        name: 'attribute',
        required: true,
        description: 'Attribute to add',
    })
    @ApiQuery({
        name: 'attribute',
        required: true,
        description: 'Attribute to add',
    })
    @ApiQuery({
        name: 'name',
        required: true,
        description: 'Record of the attribute',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async addAttribute(
        @Query('attribute') attribute: string,
        @Query('name') newRecord: string,
        @Res() res: Response,
    ) {
        await this.userService.addAttribute(attribute, newRecord);
        res.status(201).send({
            message: `Attribute ${attribute} added successfully`,
        });
    }

    @ApiOperation({ summary: 'Delete an attribute [ADMIN]' })
    @ApiBearerAuth('access-token')
    @ApiResponse({
        status: 200,
        description: 'Attribute deleted successfully',
    })
    @Delete('attribute')
    @ApiQuery({
        name: 'attribute',
        required: true,
        description: 'Type of attribute to delete',
    })
    @ApiQuery({
        name: 'name',
        required: true,
        description: 'Name of the attribute to delete',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async deleteAttribute(
        @Query('attribute') attribute: string,
        @Query('name') name: string,
        @Res() res: Response,
    ) {
        await this.userService.deleteAttribute(attribute, name);
        res.status(200).send({
            message: `Attribute '${name}' deleted successfully from '${attribute}'`,
        });
    }

    @ApiOperation({ summary: 'Change order of status attribute [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Put('attribute/status')
    @ApiResponse({
        status: 200,
        description: 'Order of the status attribute changed successfully',
    })
    @ApiQuery({
        name: 'name',
        required: true,
        description: 'Status name',
    })
    @ApiQuery({
        name: 'order',
        required: true,
        description: 'New order of the status',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async changeStatusOrder(
        @Query('name') name: string,
        @Query('order') order: number,
        @Res() res: Response,
    ) {
        await this.userService.changeStatusOrder(name, order);
        res.send({
            message: `Status ${name} order changed to ${order}`,
        });
    }

    @ApiOperation({ summary: 'Add status attribute [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Post('attribute/status')
    @ApiResponse({
        status: 201,
        description: 'Status attribute added successfully',
    })
    @ApiQuery({
        name: 'name',
        required: true,
        description: 'Status name',
    })
    @ApiQuery({
        name: 'order',
        required: true,
        description: 'Order of the status',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async addStatusAttribute(
        @Query('name') name: string,
        @Query('order') order: number,
        @Res() res: Response,
    ) {
        await this.userService.addStatusAttribute(name, order);
        res.status(201).send({
            message: `Status ${name} added successfully`,
        });
    }
}

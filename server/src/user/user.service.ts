import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Parser } from 'json2csv';
import { User } from './entities/user.entity';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Model, Types } from 'mongoose';
import { Role } from '../auth/enums/roles.enum';
import { UpdateUsersDto } from './dtos/user-update.dto';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { LoggerService } from '../logger/logger.service';
import { UserRepository } from './repositories/user.repository';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Document, Packer, Paragraph, TextRun } from 'docx';

type CertificatePurpose = 'loan' | 'military' | 'job' | 'other';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService,
    ) {}

    async getMyProfile(profileUser: User): Promise<any> {
        try {
            const { id } = profileUser;
            const user = await this.userRepository.findById(id);

            if (!user) {
                throw new BadRequestException('User not found');
            }

            const foundStatus = await this.userRepository.findStatus({
                _id: user.status,
            });
            const foundProgram = await this.userRepository.findProgram({
                _id: user.program,
            });
            const foundFaculty = await this.userRepository.findFaculty({
                _id: user.faculty,
            });
            const userProfile = {
                username: user.username,
                fullname: user.fullname,
                birthday: user.birthday
                    ? user.birthday.toISOString().split('T')[0]
                    : null,
                gender: user.gender,
                faculty: foundFaculty.name,
                classYear: user.classYear,
                program: foundProgram.name,
                address: user.address ? user.address : null,
                email: user.email,
                phone: user.phone ? user.phone : null,
                status: foundStatus.name,
                id: user.id,
                role: user.role,
            };
            return userProfile;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({});
    }

    async validatePassword(password: string, user: User): Promise<boolean> {
        try {
            return await bcrypt.compare(password, user.password);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async hashPassword(password: string): Promise<string> {
        try {
            const salt: number = await bcrypt.genSalt(
                parseInt(this.configService.get('SALT'), 10),
            );

            const hashedPassword: string = await bcrypt.hash(password, salt);

            return hashedPassword;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async create(userSignUpDto: UserSignUpDto): Promise<User> {
        try {
            const {
                username,
                fullname,
                birthday,
                gender,
                faculty,
                classYear,
                program,
                address,
                email,
                password,
                phone,
            } = userSignUpDto;
            const defaultStatus = await this.userRepository.findStatus({
                name: 'Active',
            });
            const hashedPassword = await this.hashPassword(password);
            const foundProgram = await this.userRepository.findProgram({
                name: program,
            });
            const foundFaculty = await this.userRepository.findFaculty({
                name: faculty,
            });

            const user = await this.userRepository.create({
                username: username,
                email: email,
                password: hashedPassword,
                birthday: new Date(birthday),
                fullname: fullname,
                gender: gender,
                faculty: new Types.ObjectId(
                    typeof foundFaculty._id !== 'string'
                        ? foundFaculty._id.toString()
                        : foundFaculty._id,
                ),
                classYear: classYear,
                program: new Types.ObjectId(
                    typeof foundProgram._id !== 'string'
                        ? foundProgram._id.toString()
                        : foundProgram._id,
                ),
                address: address,
                phone: phone,
                status: new Types.ObjectId(
                    typeof defaultStatus._id !== 'string'
                        ? defaultStatus._id.toString()
                        : defaultStatus._id,
                ),
                otp: null,
                otpExpiry: null,
                role: Role.STUDENT,
            });

            if (!user) {
                throw new InternalServerErrorException(
                    'This email or username is already in use',
                );
            }
            this.loggerService.logOperation(
                'INFO',
                'Create a student record with student ID',
                user.username,
            );
            return user;
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateRefreshToken(
        username: string,
        refreshToken: string,
    ): Promise<void> {
        try {
            await this.userRepository.update(
                { username: username },
                { refreshToken },
            );
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updateOtp(
        email: string,
        otp: string,
        otpExpiry: Date,
    ): Promise<void> {
        try {
            await this.userRepository.update({ email }, { otp, otpExpiry });
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async updatePassword(email: string, password: string): Promise<void> {
        try {
            const hashedPassword = await this.hashPassword(password);
            await this.userRepository.update(
                { email: email },
                { password: hashedPassword, otp: null, otpExpiry: null },
            );
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async removeByStudentId(id: string): Promise<void> {
        const result = await this.userRepository.findOne({ username: id });

        if (!result) {
            throw new NotFoundException('User not found');
        }

        if (result.role === Role.ADMIN) {
            this.loggerService.logOperation(
                'ERROR',
                'Cannot delete admin account',
            );
            throw new BadRequestException('Cannot delete admin account');
        }

        const setting = await this.userRepository.findAllSetting();
        if (!setting || !setting.length) {
            throw new NotFoundException('No settings found');
        }
        const creationDeleteWindow = setting[0].creationDeleteWindow; // in minutes
        const currentDate = new Date();
        const creationDate = new Date(result.createdAt);
        const diffTime = Math.abs(
            currentDate.getTime() - creationDate.getTime(),
        );
        const diffMinutes = Math.round(diffTime / (1000 * 60));
        if (diffMinutes > creationDeleteWindow) {
            throw new BadRequestException(
                `This account is allowed to be deleted after ${creationDeleteWindow} minutes. After that, no action can be taken.`,
            );
        }

        try {
            await this.userRepository.delete({ username: id });

            this.loggerService.logOperation(
                'INFO',
                'Delete a student record with student ID',
                result.username,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async createDefaultAttributes(): Promise<void> {
        try {
            const faculties = [
                'Faculty of Law',
                'Faculty of Business English',
                'Faculty of Japanese',
                'Faculty of French',
                'Unassigned',
            ];

            let isAllCreated = true;
            for (const faculty of faculties) {
                const facultyExists = await this.userRepository.findFaculty({
                    name: faculty,
                });

                if (facultyExists === null) {
                    await this.userRepository.createFaculty({
                        name: faculty,
                    });
                    console.log(`Faculty ${faculty} created`);
                    isAllCreated = false;
                }
            }

            const programs = [
                'Formal Program',
                'High-Quality Program',
                'Advanced Program',
                'Unassigned',
            ];

            for (const program of programs) {
                const programExists = await this.userRepository.findProgram({
                    name: program,
                });

                if (programExists === null) {
                    await this.userRepository.createProgram({
                        name: program,
                    });
                    console.log(`Program ${program} created`);
                    isAllCreated = false;
                }
            }

            const statuses = [
                {
                    name: 'Active',
                    order: 2,
                },
                {
                    name: 'Graduated',
                    order: 3,
                },
                {
                    name: 'Leave',
                    order: 3,
                },
                {
                    name: 'Absent',
                    order: 3,
                },
                {
                    name: 'Unassigned',
                    order: 1,
                },
            ];

            for (const status of statuses) {
                const statusExists = await this.userRepository.findStatus({
                    name: status.name,
                });

                if (statusExists === null) {
                    await this.userRepository.createStatus({
                        name: status.name,
                        order: status.order,
                    });
                    console.log(`Status ${status.name} created`);
                    isAllCreated = false;
                }
            }

            const settings = [
                {
                    emailSuffix: '@student.university.edu.vn',
                    phonePrefix: '+84',
                },
            ];

            for (const setting of settings) {
                const settingExists = await this.userRepository.findSetting({
                    emailSuffix: setting.emailSuffix,
                });

                if (settingExists === null) {
                    await this.userRepository.createSetting(setting);
                    console.log(
                        `Setting ${setting.emailSuffix} & ${setting.phonePrefix} created`,
                    );
                    isAllCreated = false;
                }
            }

            if (isAllCreated) {
                console.log('Default attributes already exist');
            }
        } catch (error) {
            console.log('Error creating default attributes: ', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async createDefaultAdmin(): Promise<void> {
        try {
            const adminExists = await this.userRepository.findOne({
                role: Role.ADMIN,
            });

            if (adminExists === null) {
                const adminPassword: string =
                    this.configService.get('ADMIN_PASSWORD');
                const hashedPassword = await this.hashPassword(adminPassword);

                const defaultStatus = await this.userRepository.findStatus({
                    name: 'Active',
                });
                const defaultProgram = await this.userRepository.findProgram({
                    name: 'Unassigned',
                });
                const defaultFaculty = await this.userRepository.findFaculty({
                    name: 'Unassigned',
                });

                const admin = await this.userRepository.create({
                    username: this.configService.get('ADMIN_USERNAME'),
                    email: this.configService.get('ADMIN_EMAIL'),
                    password: hashedPassword,
                    role: Role.ADMIN,
                    birthday: new Date(),
                    fullname: this.configService.get('ADMIN_FULLNAME'),
                    address: 'address',
                    phone: '0123456789',
                    program: new Types.ObjectId(
                        typeof defaultProgram._id !== 'string'
                            ? defaultProgram._id.toString()
                            : defaultProgram._id,
                    ),
                    faculty: new Types.ObjectId(
                        typeof defaultFaculty._id !== 'string'
                            ? defaultFaculty._id.toString()
                            : defaultFaculty._id,
                    ),
                    status: new Types.ObjectId(
                        typeof defaultStatus._id !== 'string'
                            ? defaultStatus._id.toString()
                            : defaultStatus._id,
                    ),
                    otp: null,
                    otpExpiry: null,
                });

                console.log('Admin account created successfully', admin);
            } else {
                console.log('Admin account already exists');
            }
        } catch (error) {
            console.log(
                'Error creating default admin account: ',
                error.message,
            );
        }
    }

    async searchByNameOrStudentID(name: string, faculty?: string) {
        const regex = new RegExp(name, 'i');
        let query: any = {
            $or: [{ fullname: regex }, { username: regex }],
        };

        if (faculty) {
            const foundFaculty = await this.userRepository.findFaculty({
                name: new RegExp(faculty, 'i'),
            });
            query = {
                faculty: foundFaculty[0]._id.toString(),
                $or: [{ fullname: regex }, { username: regex }],
            };
        }

        const users = await this.userRepository.find(query);
        if (!users.length) {
            throw new NotFoundException('No users found matching the criteria');
        }

        return users;
    }

    async exportStudentCertificate(
        format: 'pdf' | 'docx' = 'pdf',
        id: string,
        purpose: CertificatePurpose,
        otherReason?: string,
    ): Promise<Buffer> {
        const student = await this.userRepository.findById(id);
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        // TBD: Configurable validUntil
        const purposeMapping: Record<
            CertificatePurpose,
            { description: string; validUntil: string }
        > = {
            loan: {
                description: 'Xác nhận đang học để vay vốn ngân hàng',
                validUntil: '31/12/2025',
            },
            military: {
                description: 'Xác nhận làm thủ tục tạm hoãn nghĩa vụ quân sự',
                validUntil: '04/06/2025',
            },
            job: {
                description: 'Xác nhận làm hồ sơ xin việc / thực tập',
                validUntil: '31/12/2025',
            },
            other: {
                description: `Xác nhận lý do khác - ${otherReason || 'Không xác định'}`,
                validUntil: '31/12/2025',
            },
        };
        const foundStatus = await this.userRepository.findStatus({
            _id: student.status,
        });
        const foundProgram = await this.userRepository.findProgram({
            _id: student.program,
        });
        const foundFaculty = await this.userRepository.findFaculty({
            _id: student.faculty,
        });

        const studentData = {
            university: 'Trường Đại học Khoa học tự nhiên',
            address: '227 Nguyễn Văn Cừ, Phường 4, Quận 3, TP. Hồ Chí Minh',
            phone: '0123-456-789',
            email: 'contact@abc.edu.vn',
            name: student.fullname,
            studentId: student.username,
            birthDate: new Date(student.birthday).toLocaleDateString('vi-VN'),
            gender: student.gender,
            faculty: foundFaculty.name,
            program: foundProgram.name,
            classYear: student.classYear,
            status: foundStatus.name,
            purpose: purposeMapping[purpose].description,
            validUntil: purposeMapping[purpose].validUntil,
            issueDate: new Date().toLocaleDateString('vi-VN'),
            signatory: 'Trần Văn B (Trưởng phòng Đào tạo)',
        };

        if (format === 'pdf') {
            return this.generatePDF(studentData);
        } else {
            return this.generateDOCX(studentData);
        }
    }

    private async generatePDF(data): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Load Vietnamese-supported font
            const fontPath = path.join(
                __dirname,
                '../..',
                'fonts',
                'Roboto.ttf',
            );
            if (!fs.existsSync(fontPath)) {
                return reject(new Error('Font file not found'));
            }

            doc.font(fontPath);

            doc.fontSize(14).text(`${data.university}`, { align: 'center' });
            doc.fontSize(12)
                .text(`PHÒNG ĐÀO TẠO`, { align: 'center' })
                .moveDown();
            doc.text(`Địa chỉ: ${data.address}`).moveDown();
            doc.text(`Điện thoại: ${data.phone}`).moveDown();
            doc.text(`Email: ${data.email}`).moveDown();

            doc.fontSize(16)
                .text('GIẤY XÁC NHẬN TÌNH TRẠNG SINH VIÊN', {
                    align: 'center',
                    underline: true,
                })
                .moveDown();

            doc.text(`Trường ${data.university} xác nhận:`).moveDown();
            doc.text(`Họ và tên: ${data.name}`);
            doc.text(`Mã số sinh viên: ${data.studentId}`);
            doc.text(`Ngày sinh: ${data.birthDate}`);
            doc.text(`Giới tính: ${data.gender}`);
            doc.text(`Khoa: ${data.faculty}`);
            doc.text(`Chương trình đào tạo: ${data.program}`);
            doc.text(`Khóa: ${data.classYear}`).moveDown();

            doc.text(
                `Tình trạng sinh viên hiện tại: ${data.status}`,
            ).moveDown();
            doc.text(`Mục đích xác nhận: ${data.purpose}`).moveDown();
            doc.text(
                `Giấy xác nhận có hiệu lực đến ngày: ${data.validUntil}`,
            ).moveDown();

            doc.text(`Ngày cấp: ${data.issueDate}`).moveDown(2);
            doc.text(`${data.signatory}`, { align: 'right' }).moveDown();
            doc.text(`(Ký, ghi rõ họ tên, đóng dấu)`, { align: 'right' });

            doc.end();
        });
    }

    private async generateDOCX(data): Promise<Buffer> {
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            alignment: 'center',
                            children: [
                                new TextRun({
                                    text: `TRƯỜNG ĐẠI HỌC ${data.university}`,
                                    bold: true,
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: 'center',
                            children: [
                                new TextRun({
                                    text: `PHÒNG ĐÀO TẠO`,
                                    bold: true,
                                }),
                            ],
                        }),
                        new Paragraph(''),
                        new Paragraph(`📍 Địa chỉ: ${data.address}`),
                        new Paragraph(
                            `📞 Điện thoại: ${data.phone} | 📧 Email: ${data.email}`,
                        ),
                        new Paragraph(''),
                        new Paragraph({
                            alignment: 'center',
                            children: [
                                new TextRun({
                                    text: 'GIẤY XÁC NHẬN TÌNH TRẠNG SINH VIÊN',
                                    bold: true,
                                }),
                            ],
                        }),
                        new Paragraph(''),
                        new Paragraph(
                            `Trường Đại học ${data.university} xác nhận:`,
                        ),
                        new Paragraph(`- Họ và tên: ${data.name}`),
                        new Paragraph(`- Mã số sinh viên: ${data.studentId}`),
                        new Paragraph(`- Ngày sinh: ${data.birthDate}`),
                        new Paragraph(`- Giới tính: ${data.gender}`),
                        new Paragraph(`- Khoa: ${data.faculty}`),
                        new Paragraph(
                            `- Chương trình đào tạo: ${data.program}`,
                        ),
                        new Paragraph(`- Khóa: ${data.course}`),
                        new Paragraph(''),
                        new Paragraph(
                            `Tình trạng sinh viên hiện tại: ${data.status}`,
                        ),
                        new Paragraph(`Mục đích xác nhận: ${data.purpose}`),
                        new Paragraph(
                            `Giấy xác nhận có hiệu lực đến ngày: ${data.validUntil}`,
                        ),
                        new Paragraph(''),
                        new Paragraph(`📅 Ngày cấp: ${data.issueDate}`),
                        new Paragraph(''),
                        new Paragraph({
                            alignment: 'right',
                            children: [
                                new TextRun({
                                    text: `🖋 ${data.signatory}`,
                                    bold: true,
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: 'right',
                            children: [
                                new TextRun(`(Ký, ghi rõ họ tên, đóng dấu)`),
                            ],
                        }),
                    ],
                },
            ],
        });

        return Packer.toBuffer(doc);
    }

    async updateUniversitySettings(
        phonePrefix: string,
        emailSuffix: string,
        creationDeleteWindow: number,
    ): Promise<void> {
        try {
            const setting = await this.userRepository.findAllSetting();
            const oldPhonePrefix = setting[0].phonePrefix;
            const oldEmailSuffix = setting[0].emailSuffix;
            const oldCreationDeleteWindow = setting[0].creationDeleteWindow;

            if (
                oldPhonePrefix === phonePrefix &&
                oldEmailSuffix === emailSuffix &&
                oldCreationDeleteWindow === creationDeleteWindow
            ) {
                throw new InternalServerErrorException(
                    'Settings are already up to date',
                );
            }

            const formattedPhonePrefix = `+${phonePrefix.trim()}`;
            await this.userRepository.updateSetting(
                {},
                {
                    emailSuffix: emailSuffix,
                    phonePrefix: formattedPhonePrefix,
                    creationDeleteWindow: Number(creationDeleteWindow),
                },
            );

            this.loggerService.logOperation(
                'INFO',
                `Updated university settings: ${oldEmailSuffix} -> ${emailSuffix}, ${oldPhonePrefix} -> ${phonePrefix}, ${oldCreationDeleteWindow} -> ${creationDeleteWindow}`,
            );
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getUniversitySettings() {
        const setting = await this.userRepository.findAllSetting();
        if (!setting || !setting.length) {
            throw new NotFoundException('No settings found');
        }
        return setting[0];
    }

    async updateMultipleUsersByStudentID(records: UpdateUsersDto[]) {
        const results = [];
        for (const { id, updates } of records) {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new NotFoundException(
                    `Student with objectID ${id} not found`,
                );
            }

            const existedUsername = await this.userRepository.findOne({
                username: updates.username,
            });

            if (existedUsername && existedUsername._id.toString() !== id) {
                this.loggerService.logOperation(
                    'ERROR',
                    `Student with student ID ${updates.username} already exists`,
                );
                results.push({
                    username: updates.username,
                    status: 'error',
                    message: 'Student ID already exists',
                });
                throw new BadRequestException('Student ID already exists');
            }

            try {
                const foundStatus = await this.userRepository.findStatus({
                    name: updates.status,
                });
                const foundProgram = await this.userRepository.findProgram({
                    name: updates.program,
                });
                const foundFaculty = await this.userRepository.findFaculty({
                    name: updates.faculty,
                });
                const newUpdates = {
                    ...updates,
                    faculty: foundFaculty?._id,
                    program: foundProgram?._id,
                    status: foundStatus?._id,
                };
                if (!newUpdates.faculty) {
                    newUpdates.faculty = user.faculty;
                }
                if (!newUpdates.program) {
                    newUpdates.program = user.program;
                }
                if (!newUpdates.status) {
                    newUpdates.status = user.status;
                }
                await this.userRepository.update(
                    { username: user.username },
                    { $set: newUpdates },
                );
                this.loggerService.logOperation(
                    'INFO',
                    `Updated student with student ID ${user.username}`,
                );
                results.push({
                    username: user.username,
                    status: 'updated',
                });
            } catch (error) {
                this.loggerService.logOperation(
                    'ERROR',
                    `Failed to update student with student ID ${user.username}`,
                );
                console.log(error.message);
                results.push({
                    username: user.username,
                    status: 'error',
                    message: error.message,
                });
            }
        }

        this.loggerService.logOperation(
            'INFO',
            'Updated multiple student records',
        );
        return results;
    }

    async importUsers(file: Express.Multer.File) {
        if (!file) {
            this.loggerService.logOperation('ERROR', '', 'No file uploaded');
            throw new BadRequestException('No file uploaded');
        }

        let users = [];

        if (file.mimetype === 'application/json') {
            users = JSON.parse(file.buffer.toString());
        } else if (
            file.mimetype === 'text/csv' ||
            file.mimetype === 'application/vnd.ms-excel'
        ) {
            const csvData = file.buffer.toString();
            users = await new Promise((resolve, reject) => {
                const results = [];
                Readable.from(csvData)
                    .pipe(csvParser())
                    .on('data', (data) => results.push(data))
                    .on('end', () => resolve(results))
                    .on('error', (err) => reject(err));
            });
        } else {
            this.loggerService.logOperation(
                'ERROR',
                'Invalid file format. Use CSV or JSON',
            );
            throw new BadRequestException(
                'Invalid file format. Use CSV or JSON',
            );
        }

        try {
            const newUsers = await Promise.all(
                users.map(async (user) => {
                    const foundStatus = await this.userRepository.findStatus({
                        name: user.status,
                    });
                    const foundProgram = await this.userRepository.findProgram({
                        name: user.program,
                    });
                    const foundFaculty = await this.userRepository.findFaculty({
                        name: user.faculty,
                    });

                    return {
                        ...user,
                        faculty: foundFaculty._id.toString(),
                        program: foundProgram._id.toString(),
                        status: foundStatus._id.toString(),
                    };
                }),
            );

            await this.userRepository.insertMany(newUsers);
            this.loggerService.logOperation(
                'INFO',
                'Imported users from file',
                file.originalname,
            );
            return newUsers;
        } catch (error) {
            console.log(error.message);
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async exportUsersJson() {
        try {
            const users = await this.findAll();
            const newUsers = users.map((user) => {
                return {
                    username: user.username,
                    email: user.email,
                    fullname: user.fullname,
                    birthday: user.birthday,
                    gender: user.gender,
                    faculty: user.faculty,
                    classYear: user.classYear,
                    program: user.program,
                    address: user.address,
                    phone: user.phone,
                    status: user.status,
                    role: user.role,
                };
            });
            this.loggerService.logOperation('INFO', 'Exported users to JSON');
            return JSON.stringify(newUsers, null, 2);
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async exportUsersCsv() {
        try {
            const users = await this.findAll();
            const newUsers = users.map((user) => ({
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                birthday: user.birthday,
                gender: user.gender,
                faculty: user.faculty,
                classYear: user.classYear,
                program: user.program,
                address: user.address,
                phone: `'${user.phone}`,
                status: user.status,
                role: user.role,
            }));

            const json2csvParser = new Parser({
                withBOM: true,
            });

            this.loggerService.logOperation('INFO', 'Exported users to CSV');
            return json2csvParser.parse(newUsers);
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async fetchAttributeSchema(attribute: string): Promise<any> {
        const schemaModels: Record<string, Model<any>> = {
            faculty: this.userRepository.facultyModel,
            status: this.userRepository.statusModel,
            program: this.userRepository.programModel,
        };

        if (!schemaModels[attribute]) {
            throw new Error(`Schema for '${attribute}' not found.`);
        }

        return await schemaModels[attribute].find().exec();
    }

    async changeAttributeName(
        attribute: string,
        oldName: string,
        newName: string,
    ): Promise<void> {
        const schemaModels: Record<string, Model<any>> = {
            faculty: this.userRepository.facultyModel,
            status: this.userRepository.statusModel,
            program: this.userRepository.programModel,
        };

        if (!schemaModels[attribute]) {
            throw new Error(`Schema for '${attribute}' not found.`);
        }

        try {
            const isOldNameExists = await schemaModels[attribute]
                .findOne({ name: oldName })
                .exec();
            if (!isOldNameExists) {
                throw new NotFoundException(
                    `Attribute with name '${oldName}' not found`,
                );
            }

            const isNewNameExists = await schemaModels[attribute]
                .findOne({ name: newName })
                .exec();
            if (isNewNameExists) {
                return;
            }

            await schemaModels[attribute].findOneAndUpdate(
                { name: oldName },
                { name: newName },
            );
            this.loggerService.logOperation(
                'INFO',
                `Changed ${attribute} name from ${oldName} to ${newName}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async addAttribute(attribute: string, name: string) {
        const schemaModels: Record<string, Model<any>> = {
            faculty: this.userRepository.facultyModel,
            program: this.userRepository.programModel,
        };

        if (!schemaModels[attribute]) {
            throw new Error(`Schema for '${attribute}' not found.`);
        }

        try {
            const isNameExists = await schemaModels[attribute]
                .findOne({ name: name })
                .exec();
            if (isNameExists) {
                throw new BadRequestException(
                    `Attribute with name '${name}' already exists`,
                );
            }

            await schemaModels[attribute].create({ name: name });
            this.loggerService.logOperation(
                'INFO',
                `Added new ${attribute} with name ${name}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async changeStatusOrder(name: string, order: number) {
        const status = await this.userRepository.findStatus({ name: name });
        if (!status) {
            throw new NotFoundException(`Status with name '${name}' not found`);
        }

        try {
            const oldOrder = status.order;
            if (oldOrder === order) {
                throw new BadRequestException(
                    `Status with name '${name}' already has order ${order}`,
                );
            }

            await this.userRepository.updateStatus(
                { name: name },
                { order: order },
            );
            this.loggerService.logOperation(
                'INFO',
                `Changed status order for ${name} from ${oldOrder} to ${order}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }

    async addStatusAttribute(name: string, order: number) {
        const status = await this.userRepository.findStatus({ name: name });
        if (status) {
            throw new BadRequestException(
                `Status with name '${name}' already exists`,
            );
        }
        try {
            await this.userRepository.createStatus({
                name: name,
                order: order,
            });
            this.loggerService.logOperation(
                'INFO',
                `Added new status with name ${name} and order ${order}`,
            );
        } catch (error) {
            this.loggerService.logOperation('ERROR', error.message);
            throw new InternalServerErrorException(error.message);
        }
    }
}

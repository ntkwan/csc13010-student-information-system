import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { AccessControlService } from '../shared/shared.service';
import { LoggerService } from '../logger/logger.service';
import {
    Faculty,
    FacultySchema,
    Program,
    ProgramSchema,
    Setting,
    SettingSchema,
    Status,
    StatusSchema,
} from './entities/attributes.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Status.name, schema: StatusSchema },
            { name: Program.name, schema: ProgramSchema },
            { name: Setting.name, schema: SettingSchema },
        ]),
        UserSignUpDto,
    ],
    controllers: [UserController],
    providers: [UserService, AccessControlService, LoggerService],
    exports: [UserService, UserSignUpDto],
})
export class UserModule {}

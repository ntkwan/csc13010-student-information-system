import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './entities/user.entity';
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
import { UserRepository } from './repositories/user.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Faculty.name, schema: FacultySchema },
            { name: Status.name, schema: StatusSchema },
            { name: Program.name, schema: ProgramSchema },
            { name: Setting.name, schema: SettingSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [
        UserService,
        AccessControlService,
        LoggerService,
        UserRepository,
    ],
    exports: [UserService, UserRepository],
})
export class UserModule {}

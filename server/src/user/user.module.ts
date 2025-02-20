import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserSignUpDto } from './dtos/user-signup.dto';
import { AccessControlService } from 'src/shared/shared.service';
import { LoggerService } from '../logger/logger.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // Register the Mongoose schema
        UserSignUpDto,
    ],
    controllers: [UserController],
    providers: [UserService, AccessControlService, LoggerService],
    exports: [UserService, UserSignUpDto],
})
export class UserModule {}

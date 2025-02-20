import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { LoggerModule } from './logger/logger.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get('MAIL_HOST'),
                    port: configService.get('MAIL_PORT'),
                    auth: {
                        user: configService.get('MAIL_USER'),
                        pass: configService.get('MAIL_PASSWORD'),
                    },
                },
                defaults: {
                    from: `"server supporter" <support@server>`, // Sender's email address
                },
            }),
            inject: [ConfigService],
        }),

        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                return {
                    uri: `mongodb+srv://${configService.get('MONGO_USERNAME')}:${configService.get(
                        'MONGO_PASSWORD',
                    )}@${configService.get('MONGO_DATABASE')}/?retryWrites=true&w=majority&appName=${configService.get('MONGO_APPNAME')}`,
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                };
            },
            inject: [ConfigService],
        }),
        AuthModule,
        SharedModule,
        UserModule,
        LoggerModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

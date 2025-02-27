import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerService } from './logger/logger.service';
import { INestApplication } from '@nestjs/common';

describe('AppModule', () => {
    let module: TestingModule;
    let app: INestApplication | null = null;

    jest.setTimeout(15000);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(AppService)
            .useValue({
                getStatus: jest.fn().mockResolvedValue({ status: 'ok' }),
                getBuildInfo: jest.fn().mockResolvedValue({
                    version: '2.0',
                    buildDate: new Date().toISOString().split('T')[0],
                }),
            })
            .overrideProvider(LoggerService)
            .useValue({
                logOperation: jest.fn(),
                getLogs: jest.fn().mockResolvedValue(''),
                clearLogs: jest.fn(),
            })
            .compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should have AppController as a provider', () => {
        const controller = module.get<AppController>(AppController);
        expect(controller).toBeDefined();
    });

    it('should have AppService as a provider', () => {
        const service = module.get<AppService>(AppService);
        expect(service).toBeDefined();
    });

    it('should have LoggerService as a provider', () => {
        const loggerService = module.get<LoggerService>(LoggerService);
        expect(loggerService).toBeDefined();
    });
});

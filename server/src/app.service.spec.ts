import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AppController', () => {
    let appService: AppService;

    beforeEach(async () => {
        const mockConnection = {
            readyState: 1, // Simulates a connected state
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [
                AppService,
                { provide: getConnectionToken(), useValue: mockConnection },
            ],
        }).compile();

        appService = module.get<AppService>(AppService);
    });

    describe('getStatus', () => {
        it('should return { status: "ok" } when connection is ready', async () => {
            await expect(appService.getStatus()).resolves.toEqual({
                status: 'ok',
            });
        });

        it('should return error when connection is not ready', async () => {
            (appService as any).connection.readyState = 0;

            await expect(appService.getStatus()).resolves.toEqual({
                statusCode: 500,
                error: 'MongoDB connection is not ready',
            });
        });
    });

    describe('getBuildInfo', () => {
        it('should return default build info if file does not exist', async () => {
            const buildInfo = await appService.getBuildInfo();
            expect(buildInfo).toEqual({
                version: '3.0',
                buildDate: new Date().toISOString().split('T')[0],
            });
        });
    });
});

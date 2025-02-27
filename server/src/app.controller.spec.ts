import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
    let appController: AppController;
    let appService: AppService;

    beforeEach(async () => {
        const mockAppService = {
            getStatus: jest.fn().mockReturnValue({ status: 'ok' }),
            getBuildInfo: jest.fn().mockResolvedValue({
                version: '1.0.0',
                buildDate: '2021-07-07',
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [{ provide: AppService, useValue: mockAppService }],
        }).compile();

        appController = module.get<AppController>(AppController);
        appService = module.get<AppService>(AppService);
    });

    describe('getStatus', () => {
        it('should return { status: "ok" }', () => {
            expect(appController.getStatus()).toEqual({ status: 'ok' });
            expect(appService.getStatus).toHaveBeenCalledTimes(1);
        });
    });

    describe('getBuildInfo', () => {
        it('should return the correct build info', async () => {
            await expect(appController.getBuildInfo()).resolves.toEqual({
                version: '1.0.0',
                buildDate: '2021-07-07',
            });
            expect(appService.getBuildInfo).toHaveBeenCalledTimes(1);
        });
    });
});

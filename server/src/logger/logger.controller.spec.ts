import { Test, TestingModule } from '@nestjs/testing';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { Role } from '../auth/enums/roles.enum';
import { ATAuthGuard } from '../auth/guards/at-auth.guard';
import { Response } from 'express';

jest.mock('../auth/guards/at-auth.guard', () => ({
    ATAuthGuard: jest.fn().mockImplementation(() => ({
        canActivate: jest.fn().mockReturnValue(true),
    })),
}));

jest.mock('../auth/decorators/roles.decorator', () => ({
    Roles: jest.fn(() => () => {}),
}));

describe('LoggerController', () => {
    let controller: LoggerController;
    let loggerService: LoggerService;

    beforeEach(async () => {
        const mockLoggerService = {
            getLogs: jest.fn().mockResolvedValue('Mock logs content'),
            clearLogs: jest.fn().mockResolvedValue(undefined),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [LoggerController],
            providers: [
                { provide: LoggerService, useValue: mockLoggerService },
            ],
        }).compile();

        controller = module.get<LoggerController>(LoggerController);
        loggerService = module.get<LoggerService>(LoggerService);
    });

    describe('downloadLogs', () => {
        it('should return logs as a file download', async () => {
            const mockResponse = {
                setHeader: jest.fn(),
                send: jest.fn(),
            } as unknown as Response;

            await controller.downloadLogs(mockResponse);

            expect(loggerService.getLogs).toHaveBeenCalledTimes(1);
            expect(mockResponse.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                expect.stringMatching(
                    /attachment; filename=logs-\d{2}\/\d{2}\/\d{4}.txt/,
                ),
            );
            expect(mockResponse.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'text/plain',
            );
            expect(mockResponse.send).toHaveBeenCalledWith('Mock logs content');
        });
    });

    describe('clearLogs', () => {
        it('should clear logs and return success message', async () => {
            const result = await controller.clearLogs();

            expect(loggerService.clearLogs).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ message: 'Logs cleared successfully.' });
        });
    });
});

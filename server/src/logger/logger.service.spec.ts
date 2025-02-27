import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';
import * as fs from 'fs';

jest.mock('fs');

describe('LoggerService', () => {
    let loggerService: LoggerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [LoggerService],
        }).compile();

        loggerService = module.get<LoggerService>(LoggerService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('logOperation', () => {
        it('should append log entry to file', () => {
            const mockAppendFile = jest
                .spyOn(fs, 'appendFile')
                .mockImplementation((_, __, cb) => cb(null));

            loggerService.logOperation('TEST_OP', 'This is a test', 'User123');

            expect(mockAppendFile).toHaveBeenCalledWith(
                expect.stringContaining('app.log'),
                expect.stringContaining('TEST_OP: This is a test User123'),
                expect.any(Function),
            );
        });
    });

    describe('getLogs', () => {
        it('should return logs when file exists', async () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            jest.spyOn(fs, 'readFileSync').mockReturnValue('Mocked log data');

            const logs = await loggerService.getLogs();
            expect(logs).toBe('Mocked log data');
        });

        it('should return default message when no logs exist', async () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);

            const logs = await loggerService.getLogs();
            expect(logs).toBe('No logs available.');
        });
    });

    describe('clearLogs', () => {
        it('should clear log file when it exists', async () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(true);
            const mockWriteFileSync = jest
                .spyOn(fs, 'writeFileSync')
                .mockImplementation(() => {});

            await loggerService.clearLogs();
            expect(mockWriteFileSync).toHaveBeenCalledWith(
                expect.stringContaining('app.log'),
                '',
            );
        });

        it('should do nothing if log file does not exist', async () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            const mockWriteFileSync = jest.spyOn(fs, 'writeFileSync');

            await loggerService.clearLogs();
            expect(mockWriteFileSync).not.toHaveBeenCalled();
        });
    });
});

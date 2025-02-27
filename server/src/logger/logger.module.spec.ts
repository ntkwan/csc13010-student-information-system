import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from './logger.module';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';

describe('LoggerModule', () => {
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [LoggerModule],
        }).compile();
    });

    afterAll(async () => {
        await module.close();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should have LoggerController as a provider', () => {
        const controller = module.get<LoggerController>(LoggerController);
        expect(controller).toBeDefined();
    });

    it('should have LoggerService as a provider', () => {
        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
    });

    it('should export LoggerService', () => {
        const exportedService = module.get<LoggerService>(LoggerService);
        expect(exportedService).toBeDefined();
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlService } from './shared.service';
import { Role } from '../auth/enums/roles.enum';

describe('AccessControlService', () => {
    let accessControlService: AccessControlService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AccessControlService],
        }).compile();

        accessControlService =
            module.get<AccessControlService>(AccessControlService);
    });

    it('should be defined', () => {
        expect(accessControlService).toBeDefined();
    });

    describe('isAuthorized', () => {
        it('should allow ADMIN to access TEACHER level resources', () => {
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.ADMIN,
                    requiredRole: Role.TEACHER,
                }),
            ).toBe(true);
        });

        it('should allow ADMIN to access STUDENT level resources', () => {
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.ADMIN,
                    requiredRole: Role.STUDENT,
                }),
            ).toBe(true);
        });

        it('should allow TEACHER to access STUDENT level resources', () => {
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.TEACHER,
                    requiredRole: Role.STUDENT,
                }),
            ).toBe(true);
        });

        it('should NOT allow STUDENT to access TEACHER level resources', () => {
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.STUDENT,
                    requiredRole: Role.TEACHER,
                }),
            ).toBe(false);
        });

        it('should NOT allow STUDENT to access ADMIN level resources', () => {
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.STUDENT,
                    requiredRole: Role.ADMIN,
                }),
            ).toBe(false);
        });

        it('should allow a role to access itself', () => {
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.ADMIN,
                    requiredRole: Role.ADMIN,
                }),
            ).toBe(true);
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.TEACHER,
                    requiredRole: Role.TEACHER,
                }),
            ).toBe(true);
            expect(
                accessControlService.isAuthorized({
                    currentRole: Role.STUDENT,
                    requiredRole: Role.STUDENT,
                }),
            ).toBe(true);
        });

        it('should return false for invalid roles', () => {
            expect(
                accessControlService.isAuthorized({
                    currentRole: 'UNKNOWN' as Role,
                    requiredRole: Role.STUDENT,
                }),
            ).toBe(false);
        });
    });
});

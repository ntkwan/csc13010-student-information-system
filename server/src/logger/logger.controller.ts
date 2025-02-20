import { Controller, Get, Delete, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from './logger.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ATAuthGuard } from '../auth/guards/at-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';

@Controller('logs')
export class LoggerController {
    constructor(private readonly loggerService: LoggerService) {}

    @ApiOperation({ summary: 'Download logs [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Get('download')
    @ApiResponse({
        status: 200,
        description: 'Logs downloaded successfully',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async downloadLogs(@Res() res: Response) {
        const logs = await this.loggerService.getLogs();
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=logs-${new Intl.DateTimeFormat('en-GB', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            }).format(new Date())}.txt`,
        );
        res.setHeader('Content-Type', 'text/plain');
        res.send(logs);
    }

    @ApiOperation({ summary: 'Clear logs [ADMIN]' })
    @ApiBearerAuth('access-token')
    @Delete('clear')
    @ApiResponse({
        status: 200,
        description: 'Logs cleared successfully',
    })
    @UseGuards(ATAuthGuard)
    @Roles(Role.ADMIN)
    async clearLogs() {
        await this.loggerService.clearLogs();
        return { message: 'Logs cleared successfully.' };
    }
}

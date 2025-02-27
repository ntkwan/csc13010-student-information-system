import { Controller, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BuildInfo } from './app.interface';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiOperation({ summary: 'Check the status of the server' })
    @ApiResponse({
        status: 200,
        description: 'Server is running',
        schema: {
            example: {
                status: 'ok',
            },
        },
    })
    @HttpCode(200)
    @Get()
    getStatus() {
        return this.appService.getStatus();
    }

    @ApiOperation({ summary: 'Check the status of the server' })
    @ApiResponse({
        status: 200,
        description: 'Show the server build info',
        schema: {
            example: {
                version: '1.0.0',
                buildDate: '2021-07-07',
            },
        },
    })
    @HttpCode(200)
    @Get('build')
    getBuildInfo(): Promise<BuildInfo> {
        return this.appService.getBuildInfo();
    }
}

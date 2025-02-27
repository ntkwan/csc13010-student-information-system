import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { BuildInfo } from './app.interface';

@Injectable()
export class AppService {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    async getStatus() {
        try {
            if (this.connection.readyState === 1) {
                return { status: 'ok' };
            } else {
                throw new Error('MongoDB connection is not ready');
            }
        } catch (error) {
            return {
                statusCode: 500,
                error: error.message,
            };
        }
    }

    async getBuildInfo(): Promise<BuildInfo> {
        let buildInfo: BuildInfo;
        const buildInfoPath = path.join(__dirname, '..', 'build-info.json');
        if (fs.existsSync(buildInfoPath)) {
            buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
        }
        return buildInfo;
    }
}

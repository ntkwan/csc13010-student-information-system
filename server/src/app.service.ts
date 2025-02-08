import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

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
}

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
    private readonly logger = new Logger(LoggerService.name);
    private readonly logDir = path.join(__dirname, '../../logs');
    private readonly logFile = path.join(this.logDir, `app.log`);

    constructor() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    logOperation(operation: string, details: any, user?: string) {
        const logEntry = `[${new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        }).format(new Date())} ${new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })}] ${operation}: ${details} ${user ? `${user}\n` : '\n'}`;

        fs.appendFile(this.logFile, logEntry, (err) => {
            if (err) {
                this.logger.error('Failed to write log:', err);
            }
        });
    }

    async getLogs(): Promise<string> {
        return fs.existsSync(this.logFile)
            ? fs.readFileSync(this.logFile, 'utf8')
            : 'No logs available.';
    }

    async clearLogs() {
        if (fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '');
        }
    }
}

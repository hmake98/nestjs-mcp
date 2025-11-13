import { Logger as NestLogger } from '@nestjs/common';
import { LogLevel, LogLevelName } from '../interfaces';

// Re-export for backward compatibility
export { LogLevel, LogLevelName };

const LOG_LEVEL_MAP: Record<LogLevelName, LogLevel> = {
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    debug: LogLevel.DEBUG,
    verbose: LogLevel.VERBOSE,
};

/**
 * Custom logger for MCP module with log level support
 */
export class MCPLogger {
    private readonly nestLogger: NestLogger;
    private logLevel: LogLevel;

    constructor(
        context: string,
        logLevel: LogLevel | LogLevelName = LogLevel.INFO,
    ) {
        this.nestLogger = new NestLogger(context);
        this.logLevel =
            typeof logLevel === 'string' ? LOG_LEVEL_MAP[logLevel] : logLevel;
    }

    /**
     * Set the log level
     */
    setLogLevel(level: LogLevel | LogLevelName): void {
        this.logLevel =
            typeof level === 'string' ? LOG_LEVEL_MAP[level] : level;
    }

    /**
     * Get current log level
     */
    getLogLevel(): LogLevel {
        return this.logLevel;
    }

    /**
     * Check if a log level is enabled
     */
    private isLevelEnabled(level: LogLevel): boolean {
        return this.logLevel >= level;
    }

    /**
     * Log an error message
     */
    error(message: string, trace?: string | unknown, context?: string): void {
        if (this.isLevelEnabled(LogLevel.ERROR)) {
            if (typeof trace !== 'string') {
                // If trace is not a string, stringify it
                const traceStr =
                    trace instanceof Error
                        ? trace.stack || trace.message
                        : JSON.stringify(trace);
                this.nestLogger.error(message, traceStr, context);
            } else {
                this.nestLogger.error(message, trace, context);
            }
        }
    }

    /**
     * Log a warning message
     */
    warn(message: string, context?: string): void {
        if (this.isLevelEnabled(LogLevel.WARN)) {
            this.nestLogger.warn(message, context);
        }
    }

    /**
     * Log an info message
     */
    log(message: string, context?: string): void {
        if (this.isLevelEnabled(LogLevel.INFO)) {
            this.nestLogger.log(message, context);
        }
    }

    /**
     * Log a debug message
     */
    debug(message: string, context?: string): void {
        if (this.isLevelEnabled(LogLevel.DEBUG)) {
            this.nestLogger.debug(message, context);
        }
    }

    /**
     * Log a verbose message
     */
    verbose(message: string, context?: string): void {
        if (this.isLevelEnabled(LogLevel.VERBOSE)) {
            this.nestLogger.verbose(message, context);
        }
    }
}

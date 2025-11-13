/**
 * Log levels for the MCP module
 */
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    VERBOSE = 4,
}

/**
 * Map log level names to enum values
 */
export type LogLevelName = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

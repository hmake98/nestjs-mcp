import { Logger as NestLogger } from '@nestjs/common';
import { MCPLogger, LogLevel } from '../../src/utils/logger';

// Mock NestLogger
jest.mock('@nestjs/common', () => ({
    Logger: jest.fn().mockImplementation(() => ({
        error: jest.fn(),
        warn: jest.fn(),
        log: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
    })),
}));

describe('MCPLogger', () => {
    let logger: MCPLogger;
    let nestLoggerMock: jest.Mocked<NestLogger>;

    beforeEach(() => {
        jest.clearAllMocks();
        logger = new MCPLogger('TestContext');
        // Get the mock instance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nestLoggerMock = (logger as any).nestLogger;
    });

    describe('initialization', () => {
        it('should initialize with default INFO level', () => {
            expect(logger.getLogLevel()).toBe(LogLevel.INFO);
        });

        it('should initialize with numeric log level', () => {
            const customLogger = new MCPLogger('Test', LogLevel.DEBUG);
            expect(customLogger.getLogLevel()).toBe(LogLevel.DEBUG);
        });

        it('should initialize with string log level', () => {
            const customLogger = new MCPLogger('Test', 'error');
            expect(customLogger.getLogLevel()).toBe(LogLevel.ERROR);
        });

        it('should initialize with "warn" string level', () => {
            const customLogger = new MCPLogger('Test', 'warn');
            expect(customLogger.getLogLevel()).toBe(LogLevel.WARN);
        });

        it('should initialize with "info" string level', () => {
            const customLogger = new MCPLogger('Test', 'info');
            expect(customLogger.getLogLevel()).toBe(LogLevel.INFO);
        });

        it('should initialize with "debug" string level', () => {
            const customLogger = new MCPLogger('Test', 'debug');
            expect(customLogger.getLogLevel()).toBe(LogLevel.DEBUG);
        });

        it('should initialize with "verbose" string level', () => {
            const customLogger = new MCPLogger('Test', 'verbose');
            expect(customLogger.getLogLevel()).toBe(LogLevel.VERBOSE);
        });
    });

    describe('setLogLevel', () => {
        it('should set log level with numeric value', () => {
            logger.setLogLevel(LogLevel.ERROR);
            expect(logger.getLogLevel()).toBe(LogLevel.ERROR);
        });

        it('should set log level with string value', () => {
            logger.setLogLevel('debug');
            expect(logger.getLogLevel()).toBe(LogLevel.DEBUG);
        });
    });

    describe('error logging', () => {
        it('should log error when level is ERROR', () => {
            logger.setLogLevel(LogLevel.ERROR);
            logger.error('Test error');
            expect(nestLoggerMock.error).toHaveBeenCalledWith(
                'Test error',
                undefined,
                undefined,
            );
        });

        it('should log error with string trace', () => {
            logger.setLogLevel(LogLevel.ERROR);
            logger.error('Test error', 'stack trace');
            expect(nestLoggerMock.error).toHaveBeenCalledWith(
                'Test error',
                'stack trace',
                undefined,
            );
        });

        it('should log error with Error object trace', () => {
            logger.setLogLevel(LogLevel.ERROR);
            const error = new Error('Test error object');
            logger.error('Test error', error);
            expect(nestLoggerMock.error).toHaveBeenCalledWith(
                'Test error',
                error.stack,
                undefined,
            );
        });

        it('should log error with Error object without stack', () => {
            logger.setLogLevel(LogLevel.ERROR);
            const error = new Error('Test error object');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (error as any).stack;
            logger.error('Test error', error);
            expect(nestLoggerMock.error).toHaveBeenCalledWith(
                'Test error',
                'Test error object',
                undefined,
            );
        });

        it('should log error with non-string non-Error trace', () => {
            logger.setLogLevel(LogLevel.ERROR);
            const trace = { foo: 'bar' };
            logger.error('Test error', trace);
            expect(nestLoggerMock.error).toHaveBeenCalledWith(
                'Test error',
                JSON.stringify(trace),
                undefined,
            );
        });

        it('should log error with context', () => {
            logger.setLogLevel(LogLevel.ERROR);
            logger.error('Test error', 'trace', 'CustomContext');
            expect(nestLoggerMock.error).toHaveBeenCalledWith(
                'Test error',
                'trace',
                'CustomContext',
            );
        });

        it('should not log error when level is below ERROR', () => {
            logger.setLogLevel(LogLevel.ERROR);
            logger.setLogLevel(-1 as LogLevel); // Set below ERROR
            logger.error('Test error');
            expect(nestLoggerMock.error).not.toHaveBeenCalled();
        });
    });

    describe('warn logging', () => {
        it('should log warning when level is WARN or higher', () => {
            logger.setLogLevel(LogLevel.WARN);
            logger.warn('Test warning');
            expect(nestLoggerMock.warn).toHaveBeenCalledWith('Test warning');
        });

        it('should log warning with context', () => {
            logger.setLogLevel(LogLevel.WARN);
            logger.warn('Test warning', 'CustomContext');
            expect(nestLoggerMock.warn).toHaveBeenCalledWith(
                'Test warning',
                'CustomContext',
            );
        });

        it('should not log warning when level is ERROR', () => {
            logger.setLogLevel(LogLevel.ERROR);
            logger.warn('Test warning');
            expect(nestLoggerMock.warn).not.toHaveBeenCalled();
        });
    });

    describe('log (info) logging', () => {
        it('should log info when level is INFO or higher', () => {
            logger.setLogLevel(LogLevel.INFO);
            logger.log('Test info');
            expect(nestLoggerMock.log).toHaveBeenCalledWith('Test info');
        });

        it('should log info with context', () => {
            logger.setLogLevel(LogLevel.INFO);
            logger.log('Test info', 'CustomContext');
            expect(nestLoggerMock.log).toHaveBeenCalledWith(
                'Test info',
                'CustomContext',
            );
        });

        it('should not log info when level is WARN', () => {
            logger.setLogLevel(LogLevel.WARN);
            logger.log('Test info');
            expect(nestLoggerMock.log).not.toHaveBeenCalled();
        });
    });

    describe('debug logging', () => {
        it('should log debug when level is DEBUG or higher', () => {
            logger.setLogLevel(LogLevel.DEBUG);
            logger.debug('Test debug');
            expect(nestLoggerMock.debug).toHaveBeenCalledWith('Test debug');
        });

        it('should log debug with context', () => {
            logger.setLogLevel(LogLevel.DEBUG);
            logger.debug('Test debug', 'CustomContext');
            expect(nestLoggerMock.debug).toHaveBeenCalledWith(
                'Test debug',
                'CustomContext',
            );
        });

        it('should not log debug when level is INFO', () => {
            logger.setLogLevel(LogLevel.INFO);
            logger.debug('Test debug');
            expect(nestLoggerMock.debug).not.toHaveBeenCalled();
        });
    });

    describe('verbose logging', () => {
        it('should log verbose when level is VERBOSE', () => {
            logger.setLogLevel(LogLevel.VERBOSE);
            logger.verbose('Test verbose');
            expect(nestLoggerMock.verbose).toHaveBeenCalledWith('Test verbose');
        });

        it('should log verbose with context', () => {
            logger.setLogLevel(LogLevel.VERBOSE);
            logger.verbose('Test verbose', 'CustomContext');
            expect(nestLoggerMock.verbose).toHaveBeenCalledWith(
                'Test verbose',
                'CustomContext',
            );
        });

        it('should not log verbose when level is DEBUG', () => {
            logger.setLogLevel(LogLevel.DEBUG);
            logger.verbose('Test verbose');
            expect(nestLoggerMock.verbose).not.toHaveBeenCalled();
        });
    });

    describe('log level filtering', () => {
        it('should log all levels when set to VERBOSE', () => {
            logger.setLogLevel(LogLevel.VERBOSE);

            logger.error('error');
            logger.warn('warn');
            logger.log('log');
            logger.debug('debug');
            logger.verbose('verbose');

            expect(nestLoggerMock.error).toHaveBeenCalled();
            expect(nestLoggerMock.warn).toHaveBeenCalled();
            expect(nestLoggerMock.log).toHaveBeenCalled();
            expect(nestLoggerMock.debug).toHaveBeenCalled();
            expect(nestLoggerMock.verbose).toHaveBeenCalled();
        });

        it('should only log error when set to ERROR', () => {
            logger.setLogLevel(LogLevel.ERROR);

            logger.error('error');
            logger.warn('warn');
            logger.log('log');
            logger.debug('debug');
            logger.verbose('verbose');

            expect(nestLoggerMock.error).toHaveBeenCalled();
            expect(nestLoggerMock.warn).not.toHaveBeenCalled();
            expect(nestLoggerMock.log).not.toHaveBeenCalled();
            expect(nestLoggerMock.debug).not.toHaveBeenCalled();
            expect(nestLoggerMock.verbose).not.toHaveBeenCalled();
        });
    });
});

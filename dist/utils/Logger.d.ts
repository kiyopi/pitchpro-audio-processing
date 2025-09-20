/**
 * PitchPro Logger - Structured logging with levels and context
 *
 * Provides structured logging functionality with different levels,
 * prefixes, and context information for better debugging and monitoring.
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}
export interface LogContext {
    component?: string;
    operation?: string;
    userId?: string;
    sessionId?: string;
    timestamp?: number;
    [key: string]: any;
}
export interface LogEntry {
    level: LogLevel;
    message: string;
    context?: LogContext;
    timestamp: number;
    prefix?: string;
}
export declare class Logger {
    private level;
    private prefix;
    private context;
    private listeners;
    constructor(level?: LogLevel, prefix?: string, defaultContext?: LogContext);
    /**
     * Set the minimum log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Add a log listener for custom handling
     */
    addListener(listener: (entry: LogEntry) => void): void;
    /**
     * Remove a log listener
     */
    removeListener(listener: (entry: LogEntry) => void): void;
    /**
     * Create a child logger with additional context
     */
    child(prefix: string, additionalContext?: LogContext): Logger;
    /**
     * Log a debug message
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log an info message
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log a warning message
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log an error message
     */
    error(message: string, error?: Error, context?: LogContext): void;
    /**
     * Core logging method
     */
    private log;
    /**
     * Format and output to console
     */
    private logToConsole;
    /**
     * Get appropriate console method for log level
     */
    private getConsoleMethod;
    /**
     * Get current log level
     */
    getLevel(): LogLevel;
    /**
     * Check if a level is enabled
     */
    isLevelEnabled(level: LogLevel): boolean;
}
export declare const defaultLogger: Logger;
export declare const debug: (message: string, context?: LogContext) => void;
export declare const info: (message: string, context?: LogContext) => void;
export declare const warn: (message: string, context?: LogContext) => void;
export declare const error: (message: string, err?: Error, context?: LogContext) => void;
//# sourceMappingURL=Logger.d.ts.map
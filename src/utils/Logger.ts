/**
 * Logger - Global logging control for pitchpro-audio
 * 
 * Central logging control to prevent console spam in production
 */

export class Logger {
  private static DEBUG_ENABLED = false;
  private static CONSOLE_ENABLED = false;

  static log(...args: any[]): void {
    if (Logger.CONSOLE_ENABLED) {
      console.log(...args);
    }
  }

  static warn(...args: any[]): void {
    console.warn(...args); // Always show warnings
  }

  static error(...args: any[]): void {
    console.error(...args); // Always show errors
  }

  static debug(...args: any[]): void {
    if (Logger.DEBUG_ENABLED) {
      console.log('[DEBUG]', ...args);
    }
  }

  static setDebugEnabled(enabled: boolean): void {
    Logger.DEBUG_ENABLED = enabled;
  }

  static setConsoleEnabled(enabled: boolean): void {
    Logger.CONSOLE_ENABLED = enabled;
  }

  static getStatus(): { debug: boolean; console: boolean } {
    return {
      debug: Logger.DEBUG_ENABLED,
      console: Logger.CONSOLE_ENABLED
    };
  }
}
export enum ErrorCode {
  AUDIO_CONTEXT_ERROR = 'AUDIO_CONTEXT_ERROR',
  MICROPHONE_ACCESS_DENIED = 'MICROPHONE_ACCESS_DENIED',
  PITCH_DETECTION_ERROR = 'PITCH_DETECTION_ERROR',
  BUFFER_OVERFLOW = 'BUFFER_OVERFLOW',
  INVALID_SAMPLE_RATE = 'INVALID_SAMPLE_RATE',
  DEVICE_NOT_SUPPORTED = 'DEVICE_NOT_SUPPORTED',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT'
}

export class PitchProError extends Error {
  public readonly code: ErrorCode;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCode,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'PitchProError';
    this.code = code;
    this.timestamp = new Date();
    this.context = context;
    
    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PitchProError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }
}

export class AudioContextError extends PitchProError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.AUDIO_CONTEXT_ERROR, context);
    this.name = 'AudioContextError';
  }
}

export class MicrophoneAccessError extends PitchProError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.MICROPHONE_ACCESS_DENIED, context);
    this.name = 'MicrophoneAccessError';
  }
}

export class PitchDetectionError extends PitchProError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.PITCH_DETECTION_ERROR, context);
    this.name = 'PitchDetectionError';
  }
}

export function handleError(error: unknown): PitchProError {
  if (error instanceof PitchProError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new PitchProError(
      error.message,
      ErrorCode.PITCH_DETECTION_ERROR,
      { originalError: error.name }
    );
  }
  
  return new PitchProError(
    'An unknown error occurred',
    ErrorCode.PITCH_DETECTION_ERROR,
    { error: String(error) }
  );
}

export function isRecoverableError(error: PitchProError): boolean {
  const recoverableErrors = [
    ErrorCode.BUFFER_OVERFLOW,
    ErrorCode.PROCESSING_TIMEOUT,
    ErrorCode.PITCH_DETECTION_ERROR
  ];
  
  return recoverableErrors.includes(error.code);
}
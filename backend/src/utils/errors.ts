import { ZodError } from 'zod';

export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

export const handleZodError = (error: ZodError): AppError => {
    const message = error.errors.map(err => err.message).join(', ');
    return new AppError(message, 400);
};

export const handleNotFoundError = (resource: string): AppError => {
    return new AppError(`${resource} not found`, 404);
};

export const handleValidationError = (message: string): AppError => {
    return new AppError(message, 422);
};

export const handleUnexpectedError = (): AppError => {
    return new AppError('An unexpected error occurred', 500);
};
import * as v from 'valibot';

export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

export const handleValibotError = (error: v.ValiError<any>): AppError => {
    const message = error.issues.map(issue => issue.message).join(', ');
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
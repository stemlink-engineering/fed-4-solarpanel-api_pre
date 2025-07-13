import { Request, Response, NextFunction } from "express"
import UnauthorizedError from "../../domain/errors/unauthorized-error";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (!req?.auth.userId) {
        throw new UnauthorizedError("Unauthorized");
    }
    next();
}

export const isBackendAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.SOLARPANEL_API_SECRET;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError("Missing or invalid authorization header");
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!expectedToken || token !== expectedToken) {
        throw new UnauthorizedError("Invalid API secret");
    }
    
    next();
}
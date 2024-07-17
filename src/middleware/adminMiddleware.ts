import { Context, Next } from 'hono';
import { verifyToken } from '../helpers/jwt';
import { getId } from '../models/user';
import { ObjectId } from 'mongodb';

export const adminMiddleware = async (c: Context, next: Next) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            throw new Error('Authorization header missing');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Error('Invalid authorization format');
        }

        const token = parts[1];
        if (!token) {
            throw new Error('Token missing');
        }

        const verifiedToken = verifyToken(token);
        if (!verifiedToken) {
            throw new Error('Token verification failed');
        }

        const user = await getId(new ObjectId(verifiedToken.userId));
        if (!user) {
            throw new Error('User not found');
        }

        if (user.email !== 'evehand@gmail.com'){
            throw new Error ('Access denied');
        }

        await next()

    } catch (error: any) {
        return c.json({ message: error.message }, 401);
    }
}
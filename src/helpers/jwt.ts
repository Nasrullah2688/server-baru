import { config } from 'dotenv';
config();
import jwt from 'jsonwebtoken';
import { TokenType } from '../types/types';

const secret = process.env.SECRET as string

export const createToken = (payload: TokenType): string => {
    return jwt.sign(payload, secret);
};

export const verifyToken = (token: string): TokenType | null => {
    try {
        const decoded = jwt.verify(token, secret) as TokenType;
        return decoded;
    } catch (error) {
        return null;
    }
};

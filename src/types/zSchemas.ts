import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const userSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(5),
    imageUrl: z.string(),
    hobbies: z.array(z.string()),
    gender: z.string(),
    address: z.string(),
    phone: z.string(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const templateSchema = z.object({
    category: z.string(),
    componentName: z.string(),
    eventId: z.string().transform((id) => new ObjectId(id)),
    fields: z.array(z.string()), 
});

export const templateSchemaCreate = z.object({
    category: z.string(),
    componentName: z.string()
});
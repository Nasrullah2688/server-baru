import { Context } from "hono";
import { ZodError } from "zod";

export const handleError = (c: Context, error: any) => {
    if (error instanceof ZodError) {
        return c.json({ message: `Validation failed: ${error.errors[0].path[0]} ${error.errors[0].message}` }, 400);
    }
    return c.json({ message: 'An error occurred', error: error.message }, 500);
};
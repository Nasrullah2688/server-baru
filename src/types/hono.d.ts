import 'hono';

declare module 'hono' {
    interface HonoRequest {
        user?: {
            userId: string;
            email: string;
        };
    }
}  
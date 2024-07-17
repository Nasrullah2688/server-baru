import { Hono } from 'hono';
import { createUser, loginUser } from '../controllers/userController';

const authRouter = new Hono();

authRouter.post('/login', loginUser);
authRouter.post('/register', createUser);

export default authRouter
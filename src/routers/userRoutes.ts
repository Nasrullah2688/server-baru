import { Hono } from 'hono';
import { getOneUser, getAllUsers, updateUserBasic, deleteUser, getOneEmail, updateUserImage } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const userRouter = new Hono();

userRouter.use('*', authMiddleware);

userRouter.get('/all', getAllUsers);
userRouter.get('/', getOneUser);
userRouter.get('/:email', getOneEmail);
userRouter.put('/update', updateUserBasic);
userRouter.patch('/update/image', updateUserImage);
userRouter.delete('/', deleteUser);

export default userRouter;
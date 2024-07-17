import { Hono } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadImage } from '../controllers/imageController';

const imageRouter = new Hono();

imageRouter.use(authMiddleware);

imageRouter.post('/', uploadImage)

export default imageRouter;
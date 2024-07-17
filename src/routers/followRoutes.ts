import { Hono } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';
import { createFollow, getFollow, getFollowing } from '../controllers/followController';

const followRouter = new Hono();

followRouter.use(authMiddleware);

followRouter.get('/followers', getFollow);
followRouter.get('/followings', getFollowing);
followRouter.post('/', createFollow);

export default followRouter;
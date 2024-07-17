import { Hono } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';
import { createTransaction , midtransNotification} from '../controllers/transactionController';

const transactionRouter = new Hono();

transactionRouter.use(authMiddleware);

transactionRouter.post('/', createTransaction)
transactionRouter.post('/notif', midtransNotification)


export default transactionRouter;
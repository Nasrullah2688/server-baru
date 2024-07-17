import { Hono } from 'hono';
import userRouter from './userRoutes';
import eventRouter from './eventRoutes';
import draftRoutes from './draftRoutes';
import imageRouter from './imageRoute';
import authRouter from './authRouters';
import followRouter from './followRoutes';
import transactionRouter from './transactionRouters';
import templateRouter from './templateRoutes';
import dataTemplateRouter from './dataTemplateRoutes'; 
const router = new Hono();

router.route('/auth', authRouter);
router.route('/users', userRouter);
router.route('/events', eventRouter);
router.route('/drafts', draftRoutes);
router.route('/uploads', imageRouter);
router.route('/follows', followRouter);
router.route('/transaction', transactionRouter);
router.route('/templates', templateRouter);
router.route('/dataTemplates', dataTemplateRouter); 

export default router;

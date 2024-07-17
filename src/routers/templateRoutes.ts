import { Hono } from 'hono';
import { createTemplate, deleteTemplate, getAllTemplates, getOneTemplate, getUserTemplate, updateTemplate } from '../controllers/templateController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const templateRouter = new Hono();

templateRouter.get('/', getAllTemplates);


templateRouter.use(authMiddleware);
templateRouter.post('/', adminMiddleware, createTemplate);
templateRouter.get('/:id', getOneTemplate);
templateRouter.get('/user/:userId', getUserTemplate);
templateRouter.put('/:id', updateTemplate);
templateRouter.delete('/:id', deleteTemplate);

export default templateRouter;

import { Hono } from 'hono';
import { createDataTemplate, deleteDataTemplate, getAllDataTemplates, getOneDataTemplate, updateDataTemplate } from '../controllers/dataTemplateController';
import { authMiddleware } from '../middleware/authMiddleware';

const dataTemplateRouter = new Hono();

// dataTemplateRouter.get('/', getAllDataTemplates);

dataTemplateRouter.use(authMiddleware);

dataTemplateRouter.get('/:id', getOneDataTemplate);
dataTemplateRouter.post('/', createDataTemplate);
dataTemplateRouter.put('/:id', updateDataTemplate);
dataTemplateRouter.delete('/:id', deleteDataTemplate);

export default dataTemplateRouter;

import { Hono } from 'hono';
import { authMiddleware } from '../middleware/authMiddleware';
import { createEvent, deleteEvent, getAllEvents, getAllEventsUser, getOneEvent, updateEvent, addParticipant ,getOneUserEvent, getUserEventSummary} from '../controllers/eventController';


const eventRouter = new Hono();

eventRouter.get('/all', getAllEvents)
eventRouter.get('/:id', getOneEvent)

eventRouter.use(authMiddleware);
eventRouter.get('/summary', getUserEventSummary);
eventRouter.get('/', getAllEventsUser)
eventRouter.post('/', createEvent)
eventRouter.put('/:id', updateEvent)
eventRouter.delete('/:id', deleteEvent)
eventRouter.post('/:id/participant', addParticipant);
eventRouter.get('/user/:id', getOneUserEvent);

export default eventRouter;
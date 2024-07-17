import { Hono } from "hono";
import { createDraft, getUserDraft } from "../controllers/draftController";
import { authMiddleware } from "../middleware/authMiddleware";

const draftRoutes = new Hono()

draftRoutes.use(authMiddleware);

draftRoutes.get('/', getUserDraft)
draftRoutes.post('/', createDraft)

export default draftRoutes
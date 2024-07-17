import { Context } from "hono";
import DraftModel from "../models/draft";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { handleError } from "../middleware/handleError";

const draftSchema = z.object({
    eventId: z.string()
});

export const getUserDraft = async (c: Context) => {
    try {
        const userId = c.req.user?.userId;
        const data = await DraftModel.userDraft(new ObjectId(userId));
        return c.json(data);
    } catch (error) {
        return handleError(c, error);
    }
}

export const createDraft = async (c: Context) => {
    try {
        const userId = c.req.user?.userId;
        const { eventId } = await c.req.json();
        const draft = draftSchema.parse({ eventId });

        const newDraft = await DraftModel.oneDraft({
            userId: new ObjectId(userId),
            eventId: new ObjectId(draft.eventId),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return c.json({ newDraft }, 201);
    } catch (error) {
        return handleError(c, error);
    }
}

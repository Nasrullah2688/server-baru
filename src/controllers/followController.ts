import { Context } from "hono";
import { ObjectId } from "mongodb";
import FollowModel from "../models/follow";
import { handleError } from "../middleware/handleError";

export async function createFollow(c: Context) {
    try {
        const userId = c.req.user?.userId
        const { followerId } = await c.req.json();

        if (!userId || !followerId) {
            return c.json({ message: 'User ID and following ID are required' }, 400);
        }

        const newFollow = await FollowModel.createFollow({
            followerId: new ObjectId(followerId),
            followingId: new ObjectId(userId),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return c.json({ message: 'Follow created', newFollow }, 201);
    } catch (error) {
        console.log(error)
        return handleError(c, error);
    }
}

export async function getFollow(c: Context) {
    try {
        const userId = c.req.user?.userId
        if (!userId) {
            return c.json({ message: 'User ID is required' }, 400);
        }
        const followers = await FollowModel.getFollowers(new ObjectId(userId));
        return c.json(followers, 200);
    } catch (error) {
        return handleError(c, error);
    }
}

export async function getFollowing(c: Context) {
    try {
        const userId = c.req.user?.userId
        if (!userId) {
            return c.json({ message: 'User ID is required' }, 400);
        }
        const followings = await FollowModel.getFollowings(new ObjectId(userId));
        return c.json(followings, 200);
    } catch (error) {
        return handleError(c, error);
    }
}
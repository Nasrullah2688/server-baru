import { ObjectId } from "mongodb";
import { getDb } from "../config/config";
import { FollowType } from "../types/types";

const FOLLOWS_COLLECTION = "follows";

class FollowModel {
    static async getCollection() {
        return getDb().then(db => db.collection(FOLLOWS_COLLECTION));
    }

    static async allFollows() {
        const collection = await this.getCollection();
        return collection.find().toArray();
    }

    static async getFollowers(userId: ObjectId) {
        const collection = await this.getCollection();
        const followers = await collection.aggregate([
            { $match: { followingId: userId } },
            {
                $lookup: {
                    from: "users",
                    localField: "followerId",
                    foreignField: "_id",
                    as: "follower_detail"
                }
            },
            { $unwind: "$follower_detail" },
            {
                $project: {
                    _id: 1,
                    follower_detail: {
                        _id: 1,
                        email: 1,
                        name: 1,
                        imageUrl: 1,
                        hobby: 1,
                        gender: 1,
                        alamat: 1,
                        no_hp: 1,
                        createdAt: 1,
                        updatedAt: 1
                    },
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]).toArray();
        return followers;
    }

    static async getFollowings(userId: ObjectId) {
        const collection = await this.getCollection();
        const followings = await collection.aggregate([
            { $match: { followerId: userId } },
            {
                $lookup: {
                    from: "users",
                    localField: "followingId",
                    foreignField: "_id",
                    as: "following_detail"
                }
            },
            { $unwind: "$following_detail" },
            {
                $project: {
                    _id: 1,
                    following_detail: {
                        _id: 1,
                        email: 1,
                        name: 1,
                        imageUrl: 1,
                        hobby: 1,
                        gender: 1,
                        alamat: 1,
                        no_hp: 1,
                        createdAt: 1,
                        updatedAt: 1
                    },
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]).toArray();
        return followings;
    }

    static async createFollow(follow: FollowType) {
        const collection = await this.getCollection();
        return collection.insertOne(follow);
    }

    static async deleteFollow(followerId: ObjectId, followingId: ObjectId) {
        const collection = await this.getCollection();
        return collection.deleteOne({ followerId, followingId });
    }
}

export default FollowModel;

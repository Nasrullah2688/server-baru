import { ObjectId } from "mongodb";
import { getDb } from "../config/config";
import { DraftType, OutputDraft } from "../types/types";

const cDraft = "drafts";

class DraftModel {
    static async getCollection() {
        const db = await getDb();
        return db.collection(cDraft);
    }

    static async userDraft(userId: ObjectId): Promise<OutputDraft[]> {
        const collection = await this.getCollection();
        const data = await collection.aggregate([
            { $match: { userId: new ObjectId(userId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "_id",
                    as: "event"
                }
            },
            { $unwind: "$event" },
            {
                $project: {
                    _id: 1,
                    user: {
                        _id: "$user._id",
                        email: "$user.email",
                        name: "$user.name",
                        password: "$user.password",
                        imageUrl: "$user.imageUrl",
                        hobbies: "$user.hobbies",
                        gender: "$user.gender",
                        address: "$user.address",
                        phone: "$user.phone",
                        createdAt: "$user.createdAt",
                        updatedAt: "$user.updatedAt"
                    },
                    event: {
                        _id: "$event._id",
                        name: "$event.name",
                        description: "$event.description",
                        location: "$event.location",
                        mapsLocation: "$event.mapsLocation",
                        ticket: "$event.ticket",
                        imageUrl:"$evnt.imageUrl",
                        time: "$event.time",
                        max_participant: "$event.max_participant",
                        category: "$event.category",
                        userId: "$event.userId",
                        price: "$event.price",
                        follback: "$event.follback",
                        userParticipant: "$event.userParticipant",
                        createdAt: "$event.createdAt",
                        updatedAt: "$event.updatedAt"
                    },
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]).toArray();

        return data as OutputDraft[];
    }

    static async oneDraft(draft: DraftType) {
        const collection = await this.getCollection();
        return collection.insertOne(draft);
    }

    static async deleteMany(filter: object) {
        const collection = await this.getCollection();
        return collection.deleteMany(filter);
    }
}

export default DraftModel;

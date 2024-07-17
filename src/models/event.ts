import { ObjectId, Sort, WithId, Document } from "mongodb";
import { getDb } from "../config/config";
import { EventType, ShowAllEvent } from "../types/types";
import DraftModel from "./draft";

const EVENTS_COLLECTION = "events";

class EventModel {
    static async getCollection() {
        return getDb().then(db => db.collection(EVENTS_COLLECTION));
    }

    static async allEvents(page: number, limit: number, search: string | null, sortField: string, sortOrder: 'asc' | 'desc'): Promise<ShowAllEvent> {
        const collection = await this.getCollection();
        const queryToFind = search ? { name: new RegExp(search, 'i') } : {};
        const skip = (page - 1) * limit;
        const totalData = await collection.countDocuments(queryToFind);
        const totalPage = Math.ceil(totalData / limit);
        const sortOption: Sort = [[sortField, sortOrder === 'asc' ? 1 : -1]];

        const data = await collection
            .find(queryToFind)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .toArray() as EventType[];

        return {
            page,
            per_page_or_limit: limit,
            page_count_or_total_page: totalPage,
            total_count_or_total_data: totalData,
            data
        };
    }

    static async oneEvent(id: ObjectId): Promise<EventType | null> {
        const collection = await this.getCollection();
        const event = await collection.findOne({ _id: id }) as WithId<Document> | null;
        if (event) {
            return event as EventType;
        }
        return null;
    }

    static async eventAll(){
        const collection = await this.getCollection()
        return collection.find().toArray()
    }

    static async oneUserEvent(userId: ObjectId, page: number, limit: number, search: string | null, sortField: string, sortOrder: 'asc' | 'desc'): Promise<ShowAllEvent> {
        const collection = await this.getCollection();
        const queryToFind = { userId, ...(search ? { name: new RegExp(search, 'i') } : {}) };
        const skip = (page - 1) * limit;
        const totalData = await collection.countDocuments(queryToFind);
        const totalPage = Math.ceil(totalData / limit);
        
        const sortOption: Sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

        const data = await collection.aggregate([
            { $match: queryToFind },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user_detail"
                }
            },
            { $unwind: "$user_detail" },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    location: 1,
                    mapsLocation: 1,
                    imageUrl: 1,
                    ticket: 1,
                    time: 1,
                    max_participant: 1,
                    category: 1,
                    price: 1,
                    follback: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user_detail: {
                        _id: 1,
                        email: 1,
                        name: 1,
                        imageUrl: 1,
                        hobbies: 1,
                        gender: 1,
                        address: 1,
                        phone: 1,
                        createdAt: 1,
                        updatedAt: 1
                    },
                    userParticipant: 1
                }
            },
            { $sort: sortOption },
            { $skip: skip },
            { $limit: limit }
        ]).toArray() as EventType[];

        return {
            page,
            per_page_or_limit: limit,
            page_count_or_total_page: totalPage,
            total_count_or_total_data: totalData,
            data
        };
    }

    static async getPrice(eventId: ObjectId) {
        const collection = await this.getCollection();
        return collection.findOne({ _id: eventId }, { projection: { price: 1 } });
    }

    static async oneCreate(event: Partial<Omit<EventType, '_id' | 'follback'>>) {
        const collection = await this.getCollection();
        return collection.insertOne(event);
    }

    static async oneUpdate(id: ObjectId, userId: ObjectId, event: Partial<Omit<EventType, '_id' | 'createdAt'>>) {
        const collection = await this.getCollection();
        return collection.updateOne({ _id: id, userId }, { $set: event });
    }

    static async oneDelete(id: ObjectId, userId: ObjectId) {
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: id, userId });
        if (result.deletedCount > 0) {
            await DraftModel.deleteMany({ eventId: id });
        }
        return result;
    }

    static async updateMaxParticipant(eventId: ObjectId, quantity: number) {
        const collection = await this.getCollection();
        return collection.updateOne(
            { _id: eventId },
            { $inc: { max_participant: -quantity } }
        );
    }

    static async createUserParticipant(eventId: ObjectId, userId: ObjectId) {
        const collection = await this.getCollection();
        return collection.updateOne(
            { _id: eventId },
            { $addToSet: { userParticipant: userId } }
        );
    }

    static async oneUserEventById(eventId: ObjectId, userId: ObjectId): Promise<EventType | null> {
        const collection = await this.getCollection();

        const event = await collection.aggregate([
            { $match: { _id: eventId, userId } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user_detail"
                }
            },
            { $unwind: "$user_detail" },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    location: 1,
                    mapsLocation: 1,
                    ticket: 1,
                    time: 1,
                    imageUrl:1,
                    max_participant: 1,
                    category: 1,
                    price: 1,
                    follback: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user_detail: {
                        _id: 1,
                        email: 1,
                        name: 1,
                        imageUrl: 1,
                        hobbies: 1,
                        gender: 1,
                        address: 1,
                        phone: 1,
                        createdAt: 1,
                        updatedAt: 1
                    },
                    userParticipant: 1
                }
            }
        ]).toArray();

        return event.length > 0 ? event[0] as EventType : null;
    }

    static async countUserEvents(userId: ObjectId): Promise<number> {
        const collection = await this.getCollection();
        return collection.countDocuments({ userId });
    }

    static async countUserParticipants(userId: ObjectId): Promise<number> {
        const collection = await this.getCollection();
        const events = await collection.find({ userId }).toArray();
        return events.reduce((acc, event) => acc + event.userParticipant.length, 0);
    }
}





export default EventModel;

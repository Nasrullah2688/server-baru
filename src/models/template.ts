import { ObjectId, Document } from "mongodb";
import { getDb } from "../config/config";
import { TemplateType, EventType } from "../types/types";

const TEMPLATES_COLLECTION = "templates";
const EVENTS_COLLECTION = "events";

class TemplateModel {
    static async getCollection() {
        return getDb().then(db => db.collection(TEMPLATES_COLLECTION));
    }

    static async getEventCollection() {
        return getDb().then(db => db.collection(EVENTS_COLLECTION));
    }
    
    static async allTemplates() {
        const collection = await this.getCollection();
        return collection.find().toArray();
    }

    static async oneTemplate(query: Partial<TemplateType>) {
        const db = await getDb();
        const templatesCollection = db.collection(TEMPLATES_COLLECTION);

        const [template] = await templatesCollection.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: EVENTS_COLLECTION,
                    localField: "eventId",
                    foreignField: "_id",
                    as: "event_detail"
                }
            },
            { $unwind: { path: "$event_detail", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        return template
    }

    static async createTemplate(template: Partial<TemplateType>) {
        const collection = await this.getCollection();
        const result = await collection.insertOne({ ...template, createdAt: new Date(), updatedAt: new Date() });
        return result
    }

    static async updateTemplate(id: ObjectId, template: Partial<TemplateType>) {
        const collection = await this.getCollection();
        return collection.updateOne({ _id: id }, { $set: { ...template, updatedAt: new Date() } });
    }

    static async deleteTemplate(id: ObjectId) {
        const collection = await this.getCollection();
        return collection.deleteOne({ _id: id });
    }
}

export default TemplateModel;

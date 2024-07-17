import { ObjectId, Document } from "mongodb";
import { getDb } from "../config/config";
import { DataTemplateType } from "../types/types";

const DATA_TEMPLATES_COLLECTION = "data_templates";
const EVENTS_COLLECTION = "events";
const TEMPLATES_COLLECTION = "templates";

class DataTemplateModel {
    static async getCollection() {
        return getDb().then(db => db.collection(DATA_TEMPLATES_COLLECTION));
    }

    static async getAllDataTemplates() {
        const collection = await this.getCollection();
        return collection.find().toArray();
    }

    static async getOneDataTemplate(id: ObjectId) {
        const collection = await this.getCollection();
        const [dataTemplate] = await collection.aggregate([
            { $match: { _id: id } },
            {
                $lookup: {
                    from: EVENTS_COLLECTION,
                    localField: "eventId",
                    foreignField: "_id",
                    as: "event_detail"
                }
            },
            { $unwind: { path: "$event_detail", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: TEMPLATES_COLLECTION,
                    localField: "templateId",
                    foreignField: "_id",
                    as: "template_detail"
                }
            },
            { $unwind: { path: "$template_detail", preserveNullAndEmptyArrays: true } }
        ]).toArray();

        return dataTemplate;
    }

    static async createDataTemplate(dataTemplate: Partial<DataTemplateType>) {
        const collection = await this.getCollection();
        const result = await collection.insertOne({ ...dataTemplate, createdAt: new Date(), updatedAt: new Date() });

        return this.getOneDataTemplate(result.insertedId);
    }

    static async updateDataTemplate(id: ObjectId, dataTemplate: Partial<DataTemplateType>) {
        const collection = await this.getCollection();
        await collection.updateOne({ _id: id }, { $set: { ...dataTemplate, updatedAt: new Date() } });

        return this.getOneDataTemplate(id);
    }

    static async deleteDataTemplate(id: ObjectId, userId: ObjectId) {
        const collection = await this.getCollection();
        return collection.deleteOne({ _id: id, userId });
    }
}

export default DataTemplateModel;

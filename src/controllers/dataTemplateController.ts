import { Context } from "hono";
import { z } from 'zod';
import DataTemplateModel from "../models/dataTemplate";
import { ObjectId } from "mongodb";
import { handleError } from "../middleware/handleError";

const dataTemplateSchema = z.object({
    eventId: z.string().transform((id) => new ObjectId(id)),
    templateId: z.string().transform((id) => new ObjectId(id)),
});

export const getAllDataTemplates = async (c: Context) => {
    try {
        const dataTemplates = await DataTemplateModel.getAllDataTemplates();
        return c.json(dataTemplates);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getOneDataTemplate = async (c: Context) => {
    try {
        const id = new ObjectId(c.req.param('id'));
        const dataTemplate = await DataTemplateModel.getOneDataTemplate(id);
        return dataTemplate ? c.json(dataTemplate) : c.json({ message: 'DataTemplate not found' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

export const createDataTemplate = async (c: Context) => {
    try {
        const userId = new ObjectId(c.req.user?.userId);
        const dataTemplateData = dataTemplateSchema.parse(await c.req.json());
        const newDataTemplate = await DataTemplateModel.createDataTemplate({
            ...dataTemplateData,
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return c.json({ message: 'DataTemplate created', newDataTemplate }, 201);
    } catch (error) {
        return handleError(c, error);
    }
};

export const updateDataTemplate = async (c: Context) => {
    try {
        const id = new ObjectId(c.req.param('id'));
        const userId = new ObjectId(c.req.user?.userId);
        const dataTemplateData = dataTemplateSchema.parse(await c.req.json());
        const updatedDataTemplate = await DataTemplateModel.updateDataTemplate(id, { ...dataTemplateData, userId, updatedAt: new Date() });
        return updatedDataTemplate ? c.json({ message: `DataTemplate ${id} updated`, updatedDataTemplate }) : c.json({ message: 'DataTemplate not found or no changes made' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

export const deleteDataTemplate = async (c: Context) => {
    try {
        const id = new ObjectId(c.req.param('id'));
        const userId = new ObjectId(c.req.user?.userId);
        const result = await DataTemplateModel.deleteDataTemplate(id, userId);
        return result.deletedCount > 0 ? c.json({ message: `DataTemplate ${id} deleted` }) : c.json({ message: 'DataTemplate not found or not authorized to delete' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

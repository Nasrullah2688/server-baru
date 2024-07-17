import { Context } from "hono";
import { z } from 'zod';
import TemplateModel from "../models/template";
import { ObjectId } from "mongodb";
import { handleError } from "../middleware/handleError";
import { templateSchema, templateSchemaCreate } from "../types/zSchemas";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebase";

export const getAllTemplates = async (c: Context) => {
    try {
        const templates = await TemplateModel.allTemplates();
        return c.json(templates);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getOneTemplate = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const template = await TemplateModel.oneTemplate({ _id: new ObjectId(id) });
        return template ? c.json(template) : c.json({ message: 'Template not found' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getUserTemplate = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const template = await TemplateModel.oneTemplate({ _id: new ObjectId(id) });
        return template ? c.json(template) : c.json({ message: 'Template not found' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

export const createTemplate = async (c: Context) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!(file instanceof File)) {
            return c.json({ error: 'No valid file uploaded' }, 400);
        }

        const templateData = body
        const buffer = await file.arrayBuffer();
        const fileName = `${templateData.componentName}_${file.name}`;
        const storageRef = ref(storage, `templates/${fileName}`);
        const snapshot = await uploadBytes(storageRef, buffer);
        const url = await getDownloadURL(snapshot.ref);

        const newTemplate = await TemplateModel.createTemplate({
            ...templateData,
            imageUrl: url,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return c.json({ message: 'Template created', newTemplate }, 201);
    } catch (error) {
        return handleError(c, error);
    }
};

export const updateTemplate = async (c: Context) => {
    try {
        const id = new ObjectId(c.req.param('id'));
        const templateData = templateSchema.parse(await c.req.json());
        const update = await TemplateModel.updateTemplate(id, { ...templateData, updatedAt: new Date() });
        if (update.modifiedCount === 0) {
            return c.json({ message: 'Template not found or no changes made' }, 404);
        }
        return c.json({ message: `Template ${id} updated`, templateData });
    } catch (error) {
        return handleError(c, error);
    }
};

export const deleteTemplate = async (c: Context) => {
    try {
        const id = new ObjectId(c.req.param('id'));
        await TemplateModel.deleteTemplate(id);
        return c.json({ message: `Template ${id} deleted` });
    } catch (error) {
        return handleError(c, error);
    }
};

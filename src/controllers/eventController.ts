import bwipjs from 'bwip-js';
import QRCode from 'qrcode';
import { Context } from "hono";
import { z } from 'zod';
import EventModel from "../models/event";
import { ObjectId } from "mongodb";
import { handleError } from "../middleware/handleError";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebase";

const eventSchema = z.object({
    name: z.string().min(10, "Name cannot be empty"),
    description: z.string().min(10, "Description cannot be empty"),
    location: z.string().min(5, "Location cannot be empty"),
    mapsLocation: z.string().min(1, "Maps location cannot be empty"),
    imageUrl: z.any().refine(val => val instanceof File || (typeof val === 'string' && val.length > 0), {
        message: 'Must be a File object or a non-empty string URL',
    }),
    ticket: z.string().min(1, "Ticket cannot be empty"),
    time: z.string().min(1, "Time cannot be empty"),
    max_participant: z.number().nonnegative("Max participant cannot be negative"),
    category: z.string().min(1, "Category cannot be empty"),
    price: z.number().nonnegative("Price cannot be negative").optional(),
});

export const getAllEvents = async (c: Context) => {
    try {
        const page = parseInt(c.req.query('page') || '1', 10);
        const limit = parseInt(c.req.query('limit') || '10', 10);
        const search = c.req.query('search') || null;
        const sortField = c.req.query('sortField') || 'createdAt';
        let sortOrder = c.req.query('sortOrder') || 'desc';

        if (sortOrder !== 'asc' && sortOrder !== 'desc') {
            sortOrder = 'desc';
        }

        const events = await EventModel.allEvents(page, limit, search, sortField, sortOrder as 'asc' | 'desc');
        return c.json(events);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getEventsAll = async (c: Context) => {
    try {
        const events = await EventModel.eventAll();
        return c.json(events);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getAllEventsUser = async (c: Context) => {
    try {
        const userId = new ObjectId(c.req.user?.userId);
        const page = parseInt(c.req.query('page') || '1', 10);
        const limit = parseInt(c.req.query('limit') || '10', 10);
        const search = c.req.query('search') || null;
        const sortField = c.req.query('sortField') || 'createdAt';
        let sortOrder = c.req.query('sortOrder') || 'desc';

        if (sortOrder !== 'asc' && sortOrder !== 'desc') {
            sortOrder = 'desc';
        }

        const events = await EventModel.oneUserEvent(userId, page, limit, search, sortField, sortOrder as 'asc' | 'desc');
        return c.json(events);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getOneEvent = async (c: Context) => {
    try {
        const id = c.req.param('id');

        if (!ObjectId.isValid(id)) {
            return c.json({ message: 'Invalid event ID format' }, 400);
        }

        const event = await EventModel.oneEvent(new ObjectId(id));
        return event ? c.json(event) : c.json({ message: 'Event not found' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

export const createEvent = async (c: Context) => {
    try {
        const userId = new ObjectId(c.req.user?.userId);
        const body = await c.req.parseBody();
        const eventData = eventSchema.parse(body);
        const file = eventData.imageUrl;

        if (!(file instanceof File)) {
            return c.json({ error: 'No valid file uploaded' }, 400);
        }

        const buffer = await file.arrayBuffer();
        const fileName = `${userId}-${eventData.name}_${file.name}`;
        const storageRef = ref(storage, `events/${fileName}`);
        const snapshot = await uploadBytes(storageRef, buffer);
        const url = await getDownloadURL(snapshot.ref);

        const newEvent = await EventModel.oneCreate({
            ...eventData,
            imageUrl: url,
            time: new Date(eventData.time),
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return c.json({ message: 'Event created', newEvent }, 201);
    } catch (error) {
        return handleError(c, error);
    }
};

export const updateEvent = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const userId = new ObjectId(c.req.user?.userId);

        if (!ObjectId.isValid(id)) {
            return c.json({ message: 'Invalid event ID format' }, 400);
        }

        const body = await c.req.parseBody();
        const eventData = eventSchema.parse(body);
        let url = eventData.imageUrl;

        if (eventData.imageUrl instanceof File) {
            const file = eventData.imageUrl;
            const buffer = await file.arrayBuffer();
            const fileName = `${userId}-${eventData.name}_${file.name}`;
            const storageRef = ref(storage, `events/${fileName}`);
            const snapshot = await uploadBytes(storageRef, buffer);
            url = await getDownloadURL(snapshot.ref);
        }

        const update = await EventModel.oneUpdate(new ObjectId(id), userId, { 
            ...eventData,
            imageUrl: url,
            time: new Date(eventData.time),
            updatedAt: new Date() 
        });

        if (update.modifiedCount === 0) {
            return c.json({ message: `Event not found or no changes made` }, 404);
        }

        return c.json({ message: `Event ${id} updated`, event: { ...eventData, imageUrl: url } });
    } catch (error) {
        return handleError(c, error);
    }
};

export const deleteEvent = async (c: Context) => {
    try {
        const id = c.req.param('id');
        const userId = new ObjectId(c.req.user?.userId);

        if (!ObjectId.isValid(id)) {
            return c.json({ message: 'Invalid event ID format' }, 400);
        }

        const result = await EventModel.oneDelete(new ObjectId(id), userId);
        if (result.deletedCount === 0) {
            return c.json({ message: 'Event not found or not authorized to delete' }, 404);
        }

        return c.json({ message: `Event ${id} deleted` });
    } catch (error) {
        return handleError(c, error);
    }
};

export const addParticipant = async (c: Context) => {
    try {
        const eventId = c.req.param('id');
        const userId = c.req.user?.userId;

        if (!ObjectId.isValid(eventId) || !userId || !ObjectId.isValid(userId)) {
            return c.json({ message: 'Format ID tidak valid' }, 400);
        }

        const eventObjId = new ObjectId(eventId);
        const userObjId = new ObjectId(userId);

        // Tambahkan peserta ke acara
        const result = await EventModel.createUserParticipant(eventObjId, userObjId);
        if (result.modifiedCount === 0) {
            return c.json({ message: 'Gagal menambahkan peserta' }, 400);
        }

        // Kurangi jumlah max_participant
        await EventModel.updateMaxParticipant(eventObjId, 1);

        // Menghasilkan nilai unik untuk QR code yang menyertakan ID event dan ID userParticipant
        const qrValue = `${eventId}-${userId}`;

        // Menghasilkan QR code dalam format buffer
        const qrBuffer = await QRCode.toBuffer(qrValue, { type: 'png', width: 300 });

        // Mengunggah QR code ke penyimpanan
        const fileName = `${eventId}-${userId}-qrcode.png`;
        const storageRef = ref(storage, `qrcodes/${fileName}`);
        const snapshot = await uploadBytes(storageRef, qrBuffer);
        const qrUrl = await getDownloadURL(snapshot.ref);

        // Simpan URL QR ke dalam database atau kirimkan ke pengguna
        // Misalnya: tambahkan ke data participant acara atau kirim email

        return c.json({ message: 'Peserta berhasil ditambahkan', qrUrl });
    } catch (error) {
        return handleError(c, error);
    }
};

export const getOneUserEvent = async (c: Context) => {
    try {
        const eventId = c.req.param('id');
        const userId = new ObjectId(c.req.user?.userId);

        if (!ObjectId.isValid(eventId) || !ObjectId.isValid(userId)) {
            return c.json({ message: 'Invalid ID format' }, 400);
        }

        const event = await EventModel.oneUserEventById(new ObjectId(eventId), userId);

        return event ? c.json(event) : c.json({ message: 'Event not found or not authorized' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getUserEventSummary = async (c: Context) => {
    try {
        const userId = new ObjectId(c.req.user?.userId);

        const totalEvents = await EventModel.countUserEvents(userId);
        const totalParticipants = await EventModel.countUserParticipants(userId);

        return c.json({
            totalEvents,
            totalParticipants
        });
    } catch (error) {
        return handleError(c, error);
    }
};


import request from 'supertest';
import { server } from '../src/index';
import { getDb, getMongoClient } from '../src/config/config';
import { Db, ObjectId } from 'mongodb';

describe('Event Tests', () => {
    let db: Db;
    let token: string;
    let eventId: string;

    beforeAll(async () => {
        db = await getDb();

        const registerResponse = await request(server)
            .post('/auth/register')
            .send({
                name: 'testuser',
                email: 'testuser@gmail.com',
                password: '12345',
                imageUrl: "http://example.com/image.jpg",
                hobbies: ["Reading", "Gaming"],
                gender: "Male",
                address: "Jl. Test Panjang",
                phone: "081234567890",
            });

        const loginResponse = await request(server)
            .post('/auth/login')
            .send({
                email: 'testuser@gmail.com',
                password: '12345'
            });

        expect(loginResponse.status).toBe(200);
        token = loginResponse.body.access_token;
    });

    afterAll(async () => {
        await db.collection('users').deleteOne({ email: 'testuser@gmail.com' });
        if (eventId) {
            await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });
        }
        const client = await getMongoClient();
        await client.close();
        server.close();
    });

    describe('POST /events', () => {
        it('should create an event successfully', async () => {
            const response = await request(server)
                .post('/events')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Test Event',
                    description: 'This is a test event',
                    location: 'Test Location',
                    mapsLocation: 'http://maps.example.com/test', // New attribute
                    ticket: 'http://tickets.example.com/test', // New attribute
                    time: new Date().toISOString(),
                    max_participant: 100,
                    category: 'Test',
                    price: 50,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Event created');
            eventId = response.body.newEvent.insertedId;
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(server)
                .post('/events')
                .send({
                    name: 'Test Event',
                    description: 'This is a test event',
                    location: 'Test Location',
                    mapsLocation: 'http://maps.example.com/test', // New attribute
                    ticket: 'http://tickets.example.com/test', // New attribute
                    time: new Date().toISOString(),
                    max_participant: 100,
                    category: 'Test',
                    price: 50,
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Authorization header missing');
        });

        it('should return error for name Required', async () => {
            const response = await request(server)
                .post('/events')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    description: 'This is a test event',
                    location: 'Test Location',
                    mapsLocation: 'http://maps.example.com/test', // New attribute
                    ticket: 'http://tickets.example.com/test', // New attribute
                    time: new Date().toISOString(),
                    max_participant: 100,
                    category: 'Test',
                    price: 50,
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('name Required');
        });
    });

    describe('GET /events/:id', () => {
        it('should retrieve a single event by ID', async () => {
            const response = await request(server)
                .get(`/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id', eventId);
        });

        it('should return error for invalid event ID format', async () => {
            const response = await request(server)
                .get(`/events/invalid-id-format`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Invalid event ID format');
        });
    });

    describe('PUT /events/:id', () => {
        it('should update an event successfully', async () => {
            const response = await request(server)
                .put(`/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Event',
                    description: 'This is an updated test event',
                    location: 'Updated Location',
                    mapsLocation: 'http://maps.example.com/updated', // New attribute
                    ticket: 'http://tickets.example.com/updated', // New attribute
                    time: new Date().toISOString(),
                    max_participant: 200,
                    category: 'Updated Test',
                    price: 100,
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe(`Event ${eventId} updated`);
        });

        it('should return error for invalid event ID format', async () => {
            const response = await request(server)
                .put(`/events/invalid-id-format`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Updated Event',
                    description: 'This is an updated test event',
                    location: 'Updated Location',
                    mapsLocation: 'http://maps.example.com/updated', // New attribute
                    ticket: 'http://tickets.example.com/updated', // New attribute
                    time: new Date().toISOString(),
                    max_participant: 200,
                    category: 'Updated Test',
                    price: 100,
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Invalid event ID format');
        });
    });

    describe('DELETE /events/:id', () => {
        it('should delete an event successfully', async () => {
            const response = await request(server)
                .delete(`/events/${eventId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe(`Event ${eventId} deleted`);
        });

        it('should return error for invalid event ID format', async () => {
            const response = await request(server)
                .delete(`/events/invalid-id-format`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Invalid event ID format');
        });
    });
});

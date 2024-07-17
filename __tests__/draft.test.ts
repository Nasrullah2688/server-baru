import request from 'supertest';
import { server } from '../src/index';
import { getDb, getMongoClient } from '../src/config/config';
import { Db, ObjectId } from 'mongodb';
import { array } from 'zod';

describe('Draft Tests', () => {
    let db: Db;
    let token: string;
    let eventId: string;
    let draftId: string;

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

        const eventResponse = await request(server)
            .post('/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Test Event',
                description: 'This is a test event',
                location: 'Test Location',
                mapsLocation: 'http://maps.example.com/test', // Ensure all attributes are included
                ticket: 'http://tickets.example.com/test',
                time: new Date().toISOString(),
                max_participant: 100,
                category: 'Test',
                price: 50,
            });

        expect(eventResponse.status).toBe(201);
        eventId = eventResponse.body.newEvent.insertedId;
    });

    afterAll(async () => {
        await db.collection('users').deleteOne({ email: 'testuser@gmail.com' });
        if (draftId) {
            await db.collection('drafts').deleteOne({ _id: new ObjectId(draftId) });
        }
        if (eventId) {
            await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });
        }
        const client = await getMongoClient();
        await client.close();
        server.close();
    });

    describe('POST /drafts', () => {
        it('should create a draft successfully', async () => {
            const response = await request(server)
                .post('/drafts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    eventId: eventId,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('newDraft');
            draftId = response.body.newDraft._id;
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(server)
                .post('/drafts')
                .send({
                    eventId: eventId,
                });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Authorization header missing');
        });

        it('should return validation error for invalid eventId', async () => {
            const response = await request(server)
                .post('/drafts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    eventId: 'invalid-event-id',
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Invalid ObjectId format');
        });
    });

    describe('GET /drafts', () => {
        it('should retrieve user drafts successfully', async () => {
            const response = await request(server)
                .get('/drafts')
                .set('Authorization', `Bearer ${token}`);
    
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
    
});

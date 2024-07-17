import request from 'supertest';
import { server } from '../src/index';
import { getDb, getMongoClient } from '../src/config/config';
import { Db, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

describe('Template Tests', () => {
    let db: Db;
    let token: string;
    let adminToken: string;
    let userId: string;
    let eventId: string;
    let templateId: string;

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
        const decoded = jwt.decode(token) as { userId: string };
        userId = decoded.userId;

        const adminRegisterResponse = await request(server)
            .post('/auth/register')
            .send({
                name: 'adminuser',
                email: 'evehand@gmail.com',
                password: '12345',
                imageUrl: "http://example.com/image.jpg",
                hobbies: ["Reading", "Gaming"],
                gender: "Male",
                address: "Jl. Admin Test Panjang",
                phone: "081234567892",
            });

        const adminLoginResponse = await request(server)
            .post('/auth/login')
            .send({
                email: 'evehand@gmail.com',
                password: '12345'
            });

        expect(adminLoginResponse.status).toBe(200);
        adminToken = adminLoginResponse.body.access_token;

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
        if (eventId) {
            await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });
        }
        if (templateId) {
            await db.collection('templates').deleteOne({ _id: new ObjectId(templateId) });
        }
        const client = await getMongoClient();
        await client.close();
        server.close();
    });

    describe('POST /templates', () => {
        it('should create a template successfully', async () => {
            const response = await request(server)
                .post('/templates')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    category: 'Test Category',
                    componentName: 'TestComponent',
                    eventId: eventId,
                    fields:["data"]
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('newTemplate');
            templateId = response.body.newTemplate._id;
        });

        it('should create error', async () => {
            const response = await request(server)
                .post('/templates')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    category: 'Test Category',
                    componentName: 'TestComponent',
                    eventId: eventId,
                    fields:"data"
                });

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Validation failed: fields Expected array, received string');
        });

        it('should return unauthorized error if no token is provided', async () => {
            const response = await request(server)
                .post('/templates')
                .send({
                    category: 'Test Category',
                    componentName: 'TestComponent',
                    eventId: eventId,
                    fields:["data"]
                });

                expect(response.status).toBe(401);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('Authorization header missing');
        });
    });

    describe('GET /templates', () => {
        it('should retrieve all templates successfully', async () => {
            const response = await request(server)
                .get('/templates')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.any(Array));
        });
    });

    describe('GET /templates/:id', () => {
        it('should retrieve a single template by ID', async () => {
            const response = await request(server)
                .get(`/templates/${templateId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id', templateId);
        });
    });

    describe('PUT /templates/:id', () => {
        it('should update a template successfully', async () => {
            const response = await request(server)
                .put(`/templates/${templateId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    category: 'Updated Category',
                    componentName: 'UpdatedComponent',
                    eventId: eventId,
                    fields:["data"]
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe(`Template ${templateId} updated`);
        });
    });

    describe('DELETE /templates/:id', () => {
        it('should delete a template successfully', async () => {
            const response = await request(server)
                .delete(`/templates/${templateId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe(`Template ${templateId} deleted`);
        });
    });
});

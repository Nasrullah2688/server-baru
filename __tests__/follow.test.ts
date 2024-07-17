import request from 'supertest';
import { server } from '../src/index';
import { getDb, getMongoClient } from '../src/config/config';
import { Db, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

describe('Follow Tests', () => {
    let db: Db;
    let token: string;
    let userId: string;
    let otherUserId: string;
    let followId: string;

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

        const otherRegisterResponse = await request(server)
            .post('/auth/register')
            .send({
                name: 'otheruser',
                email: 'otheruser@gmail.com',
                password: '12345',
                imageUrl: "http://example.com/image.jpg",
                hobbies: ["Reading", "Gaming"],
                gender: "Male",
                address: "Jl. Other Test Panjang",
                phone: "081234567891",
            });

        const otherLoginResponse = await request(server)
            .post('/auth/login')
            .send({
                email: 'otheruser@gmail.com',
                password: '12345'
            });

        expect(otherLoginResponse.status).toBe(200);
        const otherToken = otherLoginResponse.body.access_token;
        const otherDecoded = jwt.decode(otherToken) as { userId: string };
        otherUserId = otherDecoded.userId;
    });

    afterAll(async () => {
        await db.collection('users').deleteOne({ email: 'testuser@gmail.com' });
        await db.collection('users').deleteOne({ email: 'otheruser@gmail.com' });
        if (followId) {
            await db.collection('follows').deleteOne({ _id: new ObjectId(followId) });
        }
        const client = await getMongoClient();
        await client.close();
        server.close();
    });

    describe('POST /follows', () => {
        it('should create a follow relationship successfully', async () => {
            const response = await request(server)
                .post('/follows')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    followerId: otherUserId,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('newFollow');
            followId = response.body.newFollow.insertedId;
        });

        it('should create error', async () => {
            const response = await request(server)
                .post('/follows')
                .set('Authorization', `Bearer ${token}`)
                .send({
                });

                expect(response.status).toBe(400);
                expect(response.body).toHaveProperty('message');
                expect(response.body.message).toContain('User ID and following ID are required');
        });
    });

    describe('GET /follows/followers', () => {
        it('should retrieve followers successfully', async () => {
            const response = await request(server)
                .get('/follows/followers')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.any(Array));
        });
    });

    describe('GET /follows/followings', () => {
        it('should retrieve followings successfully', async () => {
            const response = await request(server)
                .get('/follows/followings')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.any(Array));
        });
    });
});

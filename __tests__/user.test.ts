import request from 'supertest';
import { server } from '../src/index';
import { getDb, getMongoClient } from '../src/config/config';
import { Db } from 'mongodb';

describe('Authentication Tests', () => {
  let token: string;
  let db: Db;
  beforeAll(async () => {
    db = await getDb();
    const registerResponse = await request(server)
      .post('/auth/register')
      .send({
        name: 'user100',
        email: 'user100@gmail.com',
        password: '12345',
        imageUrl: "http://example.com/image9.jpg",
        hobbies: [
          "Photography",
          "Swimming"
        ],
        gender: "Male",
        address: "Jl. Imam Bonjol",
        phone: "081234567890",
      });
    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(server)
      .post('/auth/login')
      .send({
        email: 'user100@gmail.com',
        password: '12345'
      });

    expect(loginResponse.status).toBe(200);
    token = loginResponse.body.access_token;
  });

  afterAll(async () => {
    const client = await getMongoClient();
    await client.close();
    server.close();
  });

  describe('GET /users/all', () => {
    it('should return an array of users', async () => {
      const response = await request(server)
        .get('/users/all')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Array));
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(server).get('/users/all');
      expect(response.status).toBe(401);
    });

    it('should return one user', async () => {
      const response = await request(server)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Object));
    });

    it('should return 404 if user not found', async () => {
      const response = await request(server)
        .get('/users/user200@gmail.com')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User not found');
    });

    it('should return one user by email', async () => {
      const response = await request(server)
        .get('/users/user100@gmail.com')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Object));
    });
  });

  describe('PUT /users', () => {
    it('should update successfully and return a message', async () => {
      const response = await request(server)
        .put('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'user200',
        });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.any(Object));
      expect(response.body).toHaveProperty('message')
    });
  });

  describe('DELETE /users', () => {
    it('should delete successfully and return a message', async () => {
      const response = await request(server)
        .delete('/users')
        .set('Authorization', `Bearer ${token}`)
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message')
    });
  })
});
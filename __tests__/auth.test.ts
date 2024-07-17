import request from 'supertest';
import { server } from '../src/index';
import { getDb, getMongoClient } from '../src/config/config';
import { Db } from 'mongodb';

describe('Authentication Tests', () => {
  let db: Db;
  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    await db.collection('users').deleteOne({ email: 'event@gmail.com' });
    const client = await getMongoClient();
    await client.close();
    server.close();
  });

  describe('POST /auth/register', () => {

    it('should fail to register and return a message', async () => {
      const registerResponse = await request(server)
        .post('/auth/register')
        .send({
          name: 'coba',
          email: 'coba@gmail.com',
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

      expect(registerResponse.status).toBe(400);
      expect(registerResponse.body).toHaveProperty('message');
      expect(registerResponse.body.message).toBe('Email already exists');
    })

    it('should fail to register with wrong data type and return a message', async () => {
      const registerResponse = await request(server)
        .post('/auth/register')
        .send({
          name: 'event',
          email: 'event@gmail.com',
          password: '12345',
          imageUrl: "http://example.com/image9.jpg",
          hobbies: "Photography",
          gender: "Male",
          address: "Jl. Imam Bonjol",
          phone: "081234567890",
        });

      expect(registerResponse.status).toBe(400);
      expect(registerResponse.body).toHaveProperty('message');
      expect(registerResponse.body.message).toMatch(/^Validation failed: /);
      expect(registerResponse.body.message).toContain('hobbies');
    })

    it('should register successfully and return a message', async () => {
      const registerResponse = await request(server)
        .post('/auth/register')
        .send({
          name: 'event',
          email: 'event@gmail.com',
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
      expect(registerResponse.body).toHaveProperty('message');
      expect(registerResponse.body.message).toBe('User created');
    });
  });

  describe('POST /auth/login', () => {
    it('should fail to login and return a message', async () => {
      const loginResponse = await request(server)
        .post('/auth/login')
        .send({
          email: 'event@gmail.com',
          password: '1234'
        });

      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body).toHaveProperty('message');
      expect(loginResponse.body.message).toBe('Invalid credentials');
    });

    it('should login successfully and return an access token', async () => {
      const loginResponse = await request(server)
        .post('/auth/login')
        .send({
          email: 'event@gmail.com',
          password: '12345'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('access_token');
    });
  });
});

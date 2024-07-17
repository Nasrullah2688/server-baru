import { Context } from 'hono';
import { allUsers, createOneUser, deleteOneUser, getEmail, getId, updateOneUser } from '../models/user';
import { comparePassword } from '../helpers/bcrypt';
import { createToken } from '../helpers/jwt';
import { ObjectId } from 'mongodb';
import { handleError } from '../middleware/handleError';
import { userSchema, loginSchema } from '../types/zSchemas';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebase";
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});



/**
 * Retrieves all users from the database.
 */
export const getAllUsers = async (c: Context) => {
    const users = await allUsers();
    return c.json(users);
};

/**
 * Retrieves a single user by ID from the database.
 */
export const getOneUser = async (c: Context) => {
    try {
        const userId = c.req.user?.userId;
        if (!userId) throw new Error("User ID is required");
        const data = await getId(new ObjectId(userId));
        return c.json(data);
    } catch (error) {
        return handleError(c, error);
    }
};

/**
 * Retrieves a single user by email from the database.
 */
export const getOneEmail = async (c: Context) => {
    try {
        const email = c.req.param('email');
        const user = await getEmail(email);
        return user ? c.json(user) : c.json({ message: 'User not found' }, 404);
    } catch (error) {
        return handleError(c, error);
    }
};

/**
 * Creates a new user in the database.
 */
export const createUser = async (c: Context) => {
    try {
        const user = userSchema.parse(await c.req.json());
        if (await getEmail(user.email)) {
            return c.json({ message: 'Email already exists' }, 400);
        }
        const newUser = await createOneUser({ ...user, createdAt: new Date(), updatedAt: new Date() });
        const token = createToken({ userId: newUser.insertedId.toHexString(), email: user.email })
        return c.json({ message: 'User created', newUser, access_token: token }, 201);
    } catch (error) {
        return handleError(c, error);
    }
};

/**
 * Updates an existing user in the database.
 */

export const updateUserBasic = async (c: Context) => {
    try {
        const userId = new ObjectId(c.req.user?.userId);
        const body = await c.req.json();

        type UpdateData = {
            name?: string;
            hobbies?: string[];
            gender?: string;
            address?: string;
            phone?: string;
            updatedAt?: Date;
        };

        const updateData: UpdateData = {};


        if (body.name) {
            updateData.name = userSchema.shape.name.parse(body.name);
        }
        if (body.hobbies) {
            updateData.hobbies = userSchema.shape.hobbies.parse(body.hobbies);
        }

        if (body.gender) {
            updateData.gender = userSchema.shape.gender.parse(body.gender);
        }
        if (body.address) {
            updateData.address = userSchema.shape.address.parse(body.address);
        }
        if (body.phone) {
            updateData.phone = userSchema.shape.phone.parse(body.phone);
        }
        
        if (Object.keys(updateData).length === 0) {
            return c.json({ message: 'Tidak ada field valid yang diberikan untuk pembaruan' }, 400);
        }

        updateData.updatedAt = new Date();

        const updatedUser = await updateOneUser(userId, updateData);

        if (updatedUser.modifiedCount === 0) {
            return c.json({ message: 'Pengguna tidak ditemukan atau tidak ada perubahan yang dilakukan' }, 404);
        }

        return c.json({ message: `Pengguna ${userId} berhasil diperbarui`, user: updateData });
    } catch (error) {
        return handleError(c, error);
    }
};

export const updateUserImage = async (c: Context) => {
    try {
        const userId = new ObjectId(c.req.user?.userId);
        const body = await c.req.parseBody();
        const imageUrl = body['imageUrl'];

        if (!imageUrl) {
            return c.json({ error: 'No valid imageUrl provided' }, 400);
        }

        let buffer: ArrayBuffer | SharedArrayBuffer;
        let contentType: string;

        if (typeof imageUrl === 'string') {
            buffer = Buffer.from(imageUrl, 'base64').buffer;
            contentType = 'image/jpeg';
        } else if (imageUrl instanceof File) {
            buffer = await imageUrl.arrayBuffer();
            contentType = imageUrl.type; 
        } else {
            return c.json({ error: 'Invalid imageUrl type provided' }, 400);
        }

        const metadata = {
            contentType
        };

        const storageRef = ref(storage, `users/${userId}/profile-image.jpg`); 
        const snapshot = await uploadBytes(storageRef, buffer, metadata);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        const updatedUser = await updateOneUser(userId, { imageUrl: downloadUrl });

        if (updatedUser.modifiedCount === 0) {
            return c.json({ message: 'User not found or no changes made' }, 404);
        }

        return c.json({ message: `User ${userId} image updated`, imageUrl: downloadUrl });
    } catch (error) {
        return handleError(c, error);
    }
};

/**
 * Deletes a user from the database.
 */
export const deleteUser = async (c: Context) => {
    try {
        const userId = new ObjectId(c.req.user?.userId);
        await deleteOneUser(userId);
        return c.json({ message: `User ${userId} deleted` });
    } catch (error) {
        return handleError(c, error);
    }
};

/**
 * Authenticates a user and returns a JWT token.
 */
export const loginUser = async (c: Context) => {
    try {
        const { email, password } = loginSchema.parse(await c.req.json());
        const user = await getEmail(email);
        if (!user || !(await comparePassword(password, user.password))) {
            return c.json({ message: 'Invalid credentials' }, 401);
        }
        const token = createToken({ userId: user._id.toHexString(), email: user.email });
        return c.json({ access_token: token }, 200);
    } catch (error) {
        return handleError(c, error);
    }
};

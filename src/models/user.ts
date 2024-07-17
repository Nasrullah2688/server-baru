import { ObjectId } from "mongodb";
import { getDb } from "../config/config";
import { hashPassword } from "../helpers/bcrypt";
import { UserType } from "../types/types";

const USERS_COLLECTION = "users";
const TEMPLATE_USER_COLLECTION = "data_templates";
const EVENTS_COLLECTION = "events";
const TEMPLATES_COLLECTION = "templates";
/**
 * Retrieves all users from the database.
 */
export const allUsers = async () => {
    const db = await getDb();
    return db.collection(USERS_COLLECTION).find().toArray();
};

/**
 * Retrieves a user by their email address.
 * @param email - The email of the user to retrieve.
 */
export const getEmail = async (email: string) => {
    const db = await getDb();
    return db.collection(USERS_COLLECTION).findOne({ email });
};

/**
 * Retrieves a user by their ID.
 * @param userId - The ObjectId of the user to retrieve.
 */
export const getId = async (userId: ObjectId) => {
    const db = await getDb();
    return db.collection(USERS_COLLECTION).findOne({ _id: userId });
};

/**
 * Creates a new user in the database.
 * @param user - The user data to insert, excluding the _id field.
 */
export const createOneUser = async (user: Omit<UserType, '_id'>) => {
    const db = await getDb();
    const newUser = { ...user, password: hashPassword(user.password) };
    return db.collection(USERS_COLLECTION).insertOne(newUser);
};

/**
 * Updates an existing user in the database.
 * @param userId - The ObjectId of the user to update.
 * @param user - The partial user data to update, excluding _id and createdAt fields.
 */
export const updateOneUser = async (userId: ObjectId, user: Partial<Omit<UserType, '_id' | 'createdAt'>>) => {
    const db = await getDb();
    return db.collection(USERS_COLLECTION).updateOne({ _id: userId }, { $set: user });
};

/**
 * Deletes a user from the database.
 * @param userId - The ObjectId of the user to delete.
 */
export const deleteOneUser = async (userId: ObjectId) => {
    const db = await getDb();
    return db.collection(USERS_COLLECTION).deleteOne({ _id: userId });
};


/**
 * Retrieves a template by user ID.
 * @param userId
 */
export const templateUser = async (userId: ObjectId) => {
    const db = await getDb()
    return db.collection(TEMPLATE_USER_COLLECTION).aggregate([
        { $match: { _id: userId } },
        {
            $lookup: {
                from: EVENTS_COLLECTION,
                localfield: "eventId",
                foreignField: "_id",
                as: "event_detail"
            }
        },
        { $unwind: "$event_detail" },
        {
            $lookup: {
                from: TEMPLATES_COLLECTION,
                localfield: "templateId",
                foreignField: "_id",
                as: "template_detail"
            }
        },
        { $unwind: "$template_detail" },
    ]).toArray();
}
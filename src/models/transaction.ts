import { ObjectId } from "mongodb";
import { getDb } from "../config/config";
import { TransactionType } from "../types/types";
import { snap } from "../config/midtrans";
import EventModel from "./event";
import { getId as getUserById } from "./user"; 

const TRANSACTIONS_COLLECTION = "transactions";

class TransactionModel {
    static async getCollection() {
        const db = await getDb();
        return db.collection(TRANSACTIONS_COLLECTION);
    }

    static async allTransactions() {
        const collection = await this.getCollection();
        return collection.find().toArray();
    }

    static async oneTransaction(id: ObjectId) {
        const collection = await this.getCollection();
        return collection.findOne({ _id: id });
    }

    static async createTransaction(transaction: Omit<TransactionType, '_id'>) {
        const collection = await this.getCollection();
        return collection.insertOne({ ...transaction, status: 'pending' });
    }

    static async updateTransaction(id: ObjectId, transaction: Partial<TransactionType>) {
        const collection = await this.getCollection();
        return collection.updateOne({ _id: id }, { $set: transaction });
    }

    static async deleteTransaction(id: ObjectId) {
        const collection = await this.getCollection();
        return collection.deleteOne({ _id: id });
    }

    static async handleFailedTransaction(eventId: ObjectId, quantity: number) {
        const db = await getDb();
        const collection = db.collection(TRANSACTIONS_COLLECTION);

        const transaction = await collection.findOneAndUpdate(
            { eventId, status: 'pending' },
            { $set: { status: 'failure' } }
        );

        // Tambahkan kembali max_participant
        await EventModel.updateMaxParticipant(eventId, -quantity);

        return { message: `Transaksi dengan eventId ${eventId} gagal diproses dan status diubah menjadi failure` };
    }

    static async handleSuccessTransaction(eventId: ObjectId) {
        const db = await getDb();
        const collection = db.collection(TRANSACTIONS_COLLECTION);

        const transaction = await collection.findOneAndUpdate(
            { eventId, status: 'pending' },
            { $set: { status: 'success' } }
        );

        return { message: `Transaksi dengan eventId ${eventId} berhasil dan status diubah menjadi success` };
    }

    static async createMidtransTransaction(userId: ObjectId, eventId: ObjectId, amount: number, quantity: number) {
        const orderId = `order-${userId.toHexString().substring(0, 6)}-${eventId.toHexString().substring(0, 6)}-${Date.now()}`;
        
        const event = await EventModel.oneEvent(eventId);
        if (!event) {
            throw new Error("Event tidak ditemukan");
        }

        const user = await getUserById(userId);
        if (!user) {
            throw new Error("User tidak ditemukan");
        }

        const transactionDetails = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount * quantity 
            },
            credit_card: {
                secure: true
            },
            item_details: [{
                id: eventId.toHexString(),
                price: amount,
                quantity: quantity,
                name: event.name 
            }],
            customer_details: {
                user_id: userId.toHexString(),
                email: user.email, 
                phone: user.no_hp 
            },
            notification_url: process.env.URL_DEPLOY
        };

        const midtransTransaction = await snap.createTransaction(transactionDetails);
        return { midtransTransaction, orderId };
    }
}

export default TransactionModel;

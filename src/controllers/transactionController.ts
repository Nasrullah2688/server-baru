import { Context } from "hono";
import { ObjectId } from "mongodb";
import { z } from 'zod';
import TransactionModel from "../models/transaction";
import { handleError } from "../middleware/handleError";
import EventModel from "../models/event";
import { MidtransTransactionFailedError } from "../models/errors"; 

const transactionSchema = z.object({
    eventId: z.string(),
    quantity: z.number().min(1)
});

/*
const harusnya = {
    userId: new ObjectId("60b8d295f8d4771a2c8a6c44"), // ID Pengguna
    eventId: new ObjectId("60b8d2b9f8d4771a2c8a6c45"), // ID Acara atau Item
    amount: 150000, // Jumlah Pembayaran
    transactionId: "txn_1234567890", // ID Unik Transaksi
    status: "success", // Status Transaksi
    createdAt: new Date(), // Tanggal dan Waktu Transaksi Dibuat
    updatedAt: new Date(), // Tanggal dan Waktu Transaksi Diperbarui
    paymentMethod: "credit_card", // Metode Pembayaran
    paymentDetails: {
        midtransTransactionId: "midtrans_1234567890", // ID Transaksi dari Midtrans
        cardType: "Visa",
        maskedCard: "4111-11**-****-1111"
    },
    description: "Pembelian tiket konser", 
}
*/

export async function createTransaction(c: Context) {
    try {
        const userId = new ObjectId(c.req.user?.userId);  
        if (!userId) {
            throw new Error("User ID diperlukan");
        }

        const { eventId, quantity } = await c.req.json();
        const event = await EventModel.oneEvent(new ObjectId(eventId));  

        if (!event) {
            throw new Error("Event tidak ditemukan");
        }

        const amount = event.price;
        const transactionData = transactionSchema.parse({ eventId, quantity });

        // Kurangi max_participant sesuai quantity
        await EventModel.updateMaxParticipant(new ObjectId(transactionData.eventId), transactionData.quantity);

        const { midtransTransaction, orderId } = await TransactionModel.createMidtransTransaction(
            userId,
            new ObjectId(transactionData.eventId),
            amount,
            transactionData.quantity
        );

        const newTransaction = await TransactionModel.createTransaction({
            userId,
            eventId: new ObjectId(transactionData.eventId),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            orderId 
        });

        return c.json({ message: 'Transaksi berhasil dibuat', newTransaction, midtransTransaction, orderId }, 201);
    } catch (error) {
        console.log(error);

        if (error instanceof MidtransTransactionFailedError) {
            const { eventId, quantity } = await c.req.json();
            await TransactionModel.handleFailedTransaction(new ObjectId(eventId), quantity);
        }
        return handleError(c, error);
    }
}
//test uji coba pakai 
export async function midtransNotification(c: Context) {
    try {
        const notification = await c.req.json();
        console.log("Notifikasi diterima:", notification);

        const { order_id, transaction_status } = notification;

        const parts = order_id.split('-');
        if (parts.length < 4) {
            throw new Error("Invalid order_id format");
        }

        const userIdHex = parts[1];
        const eventIdHex = parts[2];

        if (!ObjectId.isValid(userIdHex) || !ObjectId.isValid(eventIdHex)) {
            throw new Error("Invalid ObjectId format in order_id");
        }

        const userId = new ObjectId(userIdHex);  
        const eventId = new ObjectId(eventIdHex);  

        if (transaction_status === 'capture' || transaction_status === 'settlement') {
            await TransactionModel.handleSuccessTransaction(eventId);
        } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
            const transaction = await TransactionModel.oneTransaction(eventId);
            await TransactionModel.handleFailedTransaction(eventId, transaction?.quantity);
        }

        return c.json({ message: 'Notifikasi berhasil diproses' }, 200);
    } catch (error) {
        console.log("Error saat memproses notifikasi:", error);
        return handleError(c, error);
    }
}

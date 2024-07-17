import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY!;

if (!serverKey) {
    throw new Error('MIDTRANS_SERVER_KEY must be set');
}

export const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: serverKey
});

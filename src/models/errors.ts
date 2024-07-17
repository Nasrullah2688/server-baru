export class MidtransTransactionFailedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MidtransTransactionFailedError';
        Object.setPrototypeOf(this, MidtransTransactionFailedError.prototype);
    }
}
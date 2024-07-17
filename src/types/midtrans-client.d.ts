declare module 'midtrans-client' {
    interface TransactionDetails {
        order_id: string;
        gross_amount: number;
    }

    interface CreditCard {
        secure: boolean;
    }

    interface TransactionParameter {
        transaction_details: TransactionDetails;
        credit_card: CreditCard;
    }

    interface Transaction {
        token: string;
        redirect_url: string;
    }

    class Snap {
        constructor(config: { isProduction: boolean; serverKey: string });

        createTransaction(parameter: TransactionParameter): Promise<Transaction>;
    }
}

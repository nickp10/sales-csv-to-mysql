export interface Statement {
    id?: number;
    fileName?: string;
}

export interface Teachable {
    id?: number;
    teachableID?: number;
    purchasedAt?: Date;
    courseName?: string;
    finalPrice?: number;
    earningsUSD?: number;
    coupon?: string;
    userID?: number;
    saleID?: number;
}

export interface Udemy {
    id?: number;
    transactionID?: number;
    statementID?: number;
    date?: Date;
    userName?: string;
    courseName?: string;
    couponCode?: string;
    revenueChannel?: string;
    vendor?: string;
    price?: number;
    transactionCurrency?: string;
    taxAmount?: number;
    storeFee?: number;
    sharePrice?: number;
    instructorShare?: number;
    taxRate?: number;
    exchangeRate?: number;
}
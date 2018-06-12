export interface Course {
    id?: number;
    courseName?: string;
    teachableName?: string;
    udemyName?: string;
}

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
    userName?: string;
    userEmail?: string;
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
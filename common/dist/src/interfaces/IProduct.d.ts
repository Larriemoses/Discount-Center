export interface IProduct {
    name: string;
    description?: string;
    price?: number;
    discountedPrice?: number;
    category?: string;
    images?: string[];
    store: string;
    stock?: number;
    isActive?: boolean;
    discountCode: string;
    shopNowUrl: string;
    totalUses?: number;
    todayUses?: number;
    successRate?: number;
    likes?: number;
    dislikes?: number;
    lastDailyReset?: Date;
    slug?: string;
}
//# sourceMappingURL=IProduct.d.ts.map
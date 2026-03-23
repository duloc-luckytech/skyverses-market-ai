import mongoose, { Schema, Document } from "mongoose";

export interface IMarketplaceItem extends Document {
    imageUrl: string;
    previewUrl: string;
    description: string;
    metadata: any;
    rating: number;
    price: number;
    prompt: string;
    viewer: number;
    buyer: number;
    income: number;
    status: string;
    type: string;
    tag: string[];
    platform: string;
    creatorId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MarketplaceItemSchema: Schema = new Schema(
    {
        imageUrl: { type: String, required: true },
        previewUrl: { type: String, default: "" },
        description: { type: String, default: "" },
        metadata: { type: Schema.Types.Mixed, default: {} },
        rating: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        prompt: { type: String, default: "" },
        viewer: { type: Number, default: 0 },
        buyer: { type: Number, default: 0 },
        income: { type: Number, default: 0 },
        status: { type: String, default: "pending" },
        type: { type: String, required: true },
        tag: { type: [String], default: [] },
        platform: { type: String, default: "" },
        creatorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);


export interface IMarketplaceItemComment extends Document {
    userId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    star: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const MarketplaceItemCommentSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        itemId: { type: Schema.Types.ObjectId, ref: "MarketplaceItem", required: true },
        star: { type: Number, required: true },
        comment: { type: String, required: true },
    },
    { timestamps: true }
);

export interface IMarketplacePurchase extends Document {
    userId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

const MarketplacePurchaseSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        itemId: { type: Schema.Types.ObjectId, ref: "MarketplaceItem", required: true },
        price: { type: Number, required: true },
    },
    { timestamps: true }
);

export interface IMarketplaceItemReport extends Document {
    reporterId: mongoose.Types.ObjectId;
    itemId: mongoose.Types.ObjectId;
    reason: string;
    description: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const MarketplaceItemReportSchema: Schema = new Schema(
    {
        reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        itemId: { type: Schema.Types.ObjectId, ref: "MarketplaceItem", required: true },
        reason: { type: String, required: true },
        description: { type: String, default: "" },
        status: { type: String, default: "pending" },
    },
    { timestamps: true }
);

export const MarketplacePurchase = mongoose.model<IMarketplacePurchase>("MarketplacePurchase", MarketplacePurchaseSchema);
export const MarketplaceItemComment = mongoose.model<IMarketplaceItemComment>("MarketplaceItemComment", MarketplaceItemCommentSchema);
export const MarketplaceItem = mongoose.model<IMarketplaceItem>("MarketplaceItem", MarketplaceItemSchema);
export const MarketplaceItemReport = mongoose.model<IMarketplaceItemReport>("MarketplaceItemReport", MarketplaceItemReportSchema);

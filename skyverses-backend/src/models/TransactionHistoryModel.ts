import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionHistory extends Document {
    userId: mongoose.Types.ObjectId;
    itemId: string;
    type: string;
    amount: number;
    note: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionHistorySchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        itemId: { type: String, required: true },
        type: {
            type: String,
            enum: ["purchase", "refund", "deposit", "withdraw"],
            required: true
        },
        amount: { type: Number, required: true },
        note: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.model<ITransactionHistory>("TransactionHistory", TransactionHistorySchema);

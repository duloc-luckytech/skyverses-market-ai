// models/BankTransactionModel.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/* =====================================================
 * 🧾 1️⃣ BẢNG RAW — NHẬN TRỰC TIẾP TỪ WEBHOOK NGÂN HÀNG
 * ===================================================== */
export interface IBankTransactionTemp extends Document {
  transactionId?: string;
  payload: any;
  receivedAt: Date;
}

export interface BankTransactionTempModel
  extends Model<IBankTransactionTemp> {}

const BankTransactionTempSchema = new Schema<IBankTransactionTemp>(
  {
    transactionId: { type: String },
    payload: { type: Schema.Types.Mixed, required: true },
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

BankTransactionTempSchema.index(
  { transactionId: 1 },
  { unique: true, sparse: true }
);

export const BankTransactionTemp: BankTransactionTempModel =
  mongoose.models.BankTransactionTemp ||
  mongoose.model<IBankTransactionTemp, BankTransactionTempModel>(
    "BankTransactionTemp",
    BankTransactionTempSchema
  );

/* =====================================================
 * 🧮 2️⃣ BẢNG CHUẨN HOÁ — SAU KHI XỬ LÝ
 * ===================================================== */
export interface IBankTransaction extends Document {
  transactionId: string;
  transactionNum?: string;
  type?: string;
  amount: number;
  description?: string;
  date?: Date;
  bank?: string;
  accountNumber?: string;
  checksum?: string;
  raw?: any;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankTransactionModel
  extends Model<IBankTransaction> {}

const BankTransactionSchema = new Schema<IBankTransaction>(
  {
    transactionId: { type: String, required: true },
    transactionNum: { type: String },
    type: { type: String },
    amount: { type: Number, default: 0 },
    description: { type: String },
    date: { type: Date },
    bank: { type: String },
    accountNumber: { type: String },
    checksum: { type: String },
    raw: { type: Schema.Types.Mixed },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const BankTransaction: BankTransactionModel =
  mongoose.models.BankTransaction ||
  mongoose.model<IBankTransaction, BankTransactionModel>(
    "BankTransaction",
    BankTransactionSchema
  );

/* =====================================================
 * 💰 3️⃣ BẢNG GIAO DỊCH HỆ THỐNG
 * ===================================================== */
export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  planCode: string;
  bankTransactionId?: string;
  note: string;
  amount: number;
  status: "pending" | "success" | "failed";
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionModel extends Model<ITransaction> {}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planCode: { type: String },
    note: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    bankTransactionId: { type: String, index: true },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

export const Transaction: TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction, TransactionModel>(
    "Transaction",
    TransactionSchema
  );